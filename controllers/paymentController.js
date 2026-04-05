const crypto = require('crypto');
const axios = require('axios');
const Booking = require('../models/Booking');

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'test_secret_key_f59e8b7d18b4499ca40f68195a846e9';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateEsewaSignature(message, secret) {
    return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

// ─── eSewa ────────────────────────────────────────────────────────────────────

// POST /api/payments/esewa/initiate
exports.initiateEsewa = async (req, res) => {
    try {
        const { bookingId, advanceAmount } = req.body;

        if (!bookingId || !advanceAmount) {
            return res.status(400).json({ message: 'bookingId and advanceAmount required' });
        }

        const transactionUuid = `sneha-${bookingId}-${Date.now()}`;
        const amount = Math.round(advanceAmount); // NPR, no decimals

        // eSewa requires this exact string for signature
        const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${ESEWA_MERCHANT_CODE}`;
        const signature = generateEsewaSignature(message, ESEWA_SECRET_KEY);

        res.json({
            amount,
            transactionUuid,
            productCode: ESEWA_MERCHANT_CODE,
            signature,
            successUrl: `${BACKEND_URL}/api/payments/esewa/success`,
            failureUrl: `${FRONTEND_URL}/payment/failure?bookingId=${bookingId}`,
            esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/payments/esewa/success  (eSewa redirects here with ?data=base64)
exports.verifyEsewa = async (req, res) => {
    try {
        const { data } = req.query;
        if (!data) return res.redirect(`${FRONTEND_URL}/payment/failure`);

        // Decode base64 response from eSewa
        const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
        const { transaction_uuid, total_amount, status, transaction_code } = decoded;

        if (status !== 'COMPLETE') {
            return res.redirect(`${FRONTEND_URL}/payment/failure`);
        }

        // Extract bookingId from transaction_uuid  (format: sneha-<id>-<ts>)
        const parts = transaction_uuid.split('-');
        // bookingId is the 24-char mongo ObjectId (parts[1])
        const bookingId = parts[1];

        // Verify signature from eSewa response
        const signedFields = decoded.signed_field_names?.split(',') || [];
        const signatureMsg = signedFields.map(f => `${f}=${decoded[f]}`).join(',');
        const expectedSig = generateEsewaSignature(signatureMsg, ESEWA_SECRET_KEY);
        if (expectedSig !== decoded.signature) {
            return res.redirect(`${FRONTEND_URL}/payment/failure?reason=signature_mismatch`);
        }

        // Update booking in DB
        await Booking.findByIdAndUpdate(bookingId, {
            paymentStatus: 'Partial',
            paymentMethod: 'eSewa',
            transactionId: transaction_code,
            'financials.advancePaid': Number(total_amount),
        });

        res.redirect(`${FRONTEND_URL}/payment/success?bookingId=${bookingId}&method=eSewa&txn=${transaction_code}&amount=${total_amount}`);
    } catch (err) {
        console.error('eSewa verify error:', err);
        res.redirect(`${FRONTEND_URL}/payment/failure`);
    }
};

// ─── Khalti ───────────────────────────────────────────────────────────────────

// POST /api/payments/khalti/initiate
exports.initiateKhalti = async (req, res) => {
    try {
        const { bookingId, advanceAmount, guestName, phone } = req.body;

        if (!bookingId || !advanceAmount) {
            return res.status(400).json({ message: 'bookingId and advanceAmount required' });
        }

        const amountPaisa = Math.round(advanceAmount) * 100; // Khalti uses Paisa

        const payload = {
            return_url: `${FRONTEND_URL}/payment/success`,
            website_url: FRONTEND_URL,
            amount: amountPaisa,
            purchase_order_id: bookingId,
            purchase_order_name: 'Sneha Guest House Advance Booking',
            customer_info: {
                name: guestName || 'Guest',
                phone: phone || '',
            },
        };

        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/initiate/',
            payload,
            { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
        );

        res.json({ payment_url: response.data.payment_url, pidx: response.data.pidx });
    } catch (err) {
        console.error('Khalti initiate error:', err.response?.data || err.message);
        res.status(500).json({ message: 'Khalti initiation failed', error: err.response?.data });
    }
};

// GET /api/payments/khalti/verify?pidx=...&purchase_order_id=...
exports.verifyKhalti = async (req, res) => {
    try {
        const { pidx, purchase_order_id } = req.query;
        if (!pidx) return res.redirect(`${FRONTEND_URL}/payment/failure`);

        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
        );

        const { status, total_amount, transaction_id } = response.data;

        if (status !== 'Completed') {
            return res.redirect(`${FRONTEND_URL}/payment/failure?bookingId=${purchase_order_id}`);
        }

        const amountNPR = total_amount / 100;

        await Booking.findByIdAndUpdate(purchase_order_id, {
            paymentStatus: 'Partial',
            paymentMethod: 'Khalti',
            transactionId: transaction_id,
            'financials.advancePaid': amountNPR,
        });

        res.redirect(`${FRONTEND_URL}/payment/success?bookingId=${purchase_order_id}&method=Khalti&txn=${transaction_id}&amount=${amountNPR}`);
    } catch (err) {
        console.error('Khalti verify error:', err.response?.data || err.message);
        res.redirect(`${FRONTEND_URL}/payment/failure`);
    }
};

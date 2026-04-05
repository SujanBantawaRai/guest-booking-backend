const express = require('express');
const router = express.Router();
const {
    initiateEsewa,
    verifyEsewa,
    initiateKhalti,
    verifyKhalti,
} = require('../controllers/paymentController');

// eSewa
router.post('/esewa/initiate', initiateEsewa);
router.get('/esewa/success', verifyEsewa);     // eSewa redirects to this URL

// Khalti
router.post('/khalti/initiate', initiateKhalti);
router.get('/khalti/verify', verifyKhalti);    // Khalti redirects to this URL

module.exports = router;

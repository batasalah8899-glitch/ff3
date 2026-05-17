const express = require('express');
const router = express.Router();

// Placeholder for auth routes
router.get('/status', (req, res) => {
  res.json({ success: true, message: 'Auth routes working' });
});

module.exports = router;
const express = require('express');
const router = express.Router();

router.get('/api-key', (req, res) => {
  // Ensure you have proper authentication and authorization checks here
  res.json({ apiKey: "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" });
});

module.exports = router;
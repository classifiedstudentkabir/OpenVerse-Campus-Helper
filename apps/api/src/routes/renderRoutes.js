const express = require('express');
const router = express.Router();
const renderController = require('../controllers/renderController');

router.post('/preview', renderController.preview);

module.exports = router;

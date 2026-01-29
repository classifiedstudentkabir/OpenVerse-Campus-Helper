const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

router.post('/', batchController.createBatch);
router.post('/:id/generate', batchController.generateBatch);
router.get('/:id/status', batchController.getBatchStatus);
router.get('/:id/download', batchController.downloadBatchZip);

module.exports = router;

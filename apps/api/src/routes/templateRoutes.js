const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.getAll);
router.post('/', templateController.create);
router.get('/:id', templateController.getById);
router.put('/:id', templateController.update);

module.exports = router;

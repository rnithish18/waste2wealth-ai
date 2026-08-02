const express = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', upload.single('file'), uploadController.uploadFile);
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultipleFiles);

module.exports = router;

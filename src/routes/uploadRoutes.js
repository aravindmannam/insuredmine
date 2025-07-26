const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFile } = require('../controllers/uploadController');

const router = express.Router();

// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route
router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;

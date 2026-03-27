const express = require('express');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* POST /api/upload — upload single image */
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json({ url: req.file.path });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: err.message || 'Server error uploading file.' });
  }
});

/* POST /api/upload/multiple — upload multiple images */
router.post('/multiple', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }
    const urls = req.files.map((f) => f.path);
    res.json({ urls });
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ error: err.message || 'Server error uploading files.' });
  }
});

module.exports = router;

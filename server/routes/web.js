const path = require('path');
const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'upload');
  },
  filename(req, file, cb) {
    // You could rename the file name
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    // You could use the original name
    // cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

// Upload item
// eslint-disable-next-line no-unused-vars
router.post('/item', upload.array('file'), (req, res, next) => res.json({
  files: req.files,
}));

module.exports = router;

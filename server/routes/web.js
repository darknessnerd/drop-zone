const path = require('path');
const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'upload');
  },
  filename(req, file, cb) {
    if (req.body.chunkIndex) {
      const fileName = path.basename(file.originalname, path.extname(file.originalname));
      cb(null, `${fileName}.${path.extname(file.originalname)}-${req.body.chunkIndex}`);
    } else {
      // You could use the original name
      cb(null, file.originalname);
    }
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

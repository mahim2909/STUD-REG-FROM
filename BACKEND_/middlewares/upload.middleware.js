const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create directories if they don't exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create all required directories
const uploadDirs = [
  path.join(__dirname, '../uploads/profiles'),
  path.join(__dirname, '../uploads/resumes'),
  path.join(__dirname, '../uploads/signatures'),
  path.join(__dirname, '../uploads/marksheets')
];

uploadDirs.forEach(dir => createDirIfNotExists(dir));

// Storage configuration for different file types
const storageConfig = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, `../uploads/${folder}`));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// File type validation
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed`), false);
    }
  };
};

// Profile picture upload (JPG/JPEG, max 1MB)
const profileUpload = multer({
  storage: storageConfig('profiles'),
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: fileFilter(['.jpg', '.jpeg'])
});

// Resume upload (PDF, max 50KB)
const resumeUpload = multer({
  storage: storageConfig('resumes'),
  limits: { fileSize: 50 * 1024 }, // 50KB
  fileFilter: fileFilter(['.pdf'])
});

// Signature upload (JPG/JPEG, max 70KB)
const signatureUpload = multer({
  storage: storageConfig('signatures'),
  limits: { fileSize: 70 * 1024 }, // 70KB
  fileFilter: fileFilter(['.jpg', '.jpeg'])
});

// Marksheet upload (PDF, max 50KB)
const marksheetUpload = multer({
  storage: storageConfig('marksheets'),
  limits: { fileSize: 50 * 1024 }, // 50KB
  fileFilter: fileFilter(['.pdf'])
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Please check size requirements.'
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      message: err.message
    });
  }
  next();
};

module.exports = {
  profileUpload,
  resumeUpload,
  signatureUpload,
  marksheetUpload,
  handleUploadError
};
const studentController = require('../controllers/student.controller');
const { validateStudentInput, validateAcademicDetails } = require('../middlewares/validation.middleware');
const { 
  profileUpload, resumeUpload, signatureUpload, marksheetUpload, handleUploadError 
} = require('../middlewares/upload.middleware');
const multer = require('multer');

module.exports = (app) => {
  // Configure multer for handling multiple file uploads
  const uploadFields = [
    { name: 'profile_picture', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'marksheet_10th', maxCount: 1 },
    { name: 'marksheet_12th', maxCount: 1 },
    { name: 'marksheet_graduation', maxCount: 1 }
  ];
  
  // Configure storage and limits for each file type
  const configureUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        let folder = 'uploads/';
        
        if (file.fieldname === 'profile_picture') {
          folder += 'profiles';
        } else if (file.fieldname === 'resume') {
          folder += 'resumes';
        } else if (file.fieldname === 'signature') {
          folder += 'signatures';
        } else if (file.fieldname.startsWith('marksheet_')) {
          folder += 'marksheets';
        }
        
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
      }
    }),
    limits: {
      fileSize: (field) => {
        if (field === 'profile_picture') return 1024 * 1024; // 1MB
        if (field === 'resume' || field.startsWith('marksheet_')) return 50 * 1024; // 50KB
        if (field === 'signature') return 70 * 1024; // 70KB
        return 1024 * 1024; // Default 1MB
      }
    },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'profile_picture' || file.fieldname === 'signature') {
        if (!file.originalname.match(/\.(jpg|jpeg)$/i)) {
          return cb(new Error(`Only JPG/JPEG files are allowed for ${file.fieldname}`), false);
        }
      } else if (file.fieldname === 'resume' || file.fieldname.startsWith('marksheet_')) {
        if (!file.originalname.match(/\.(pdf)$/i)) {
          return cb(new Error(`Only PDF files are allowed for ${file.fieldname}`), false);
        }
      }
      cb(null, true);
    }
  }).fields(uploadFields);
  
  // Create a new student
  app.post('/api/students', 
    (req, res, next) => {
      configureUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          return res.status(400).json({
            message: `Upload error: ${err.message}`
          });
        } else if (err) {
          // An unknown error occurred
          return res.status(400).json({
            message: err.message
          });
        }
        next();
      });
    },
    validateStudentInput,
    validateAcademicDetails,
    studentController.create
  );
  
  // Retrieve all students
  app.get('/api/students', studentController.findAll);
  
  // Retrieve a single student
  app.get('/api/students/:id', studentController.findOne);
  
  // Update a student
  app.put('/api/students/:id', 
    (req, res, next) => {
      configureUpload(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            message: err.message
          });
        }
        next();
      });
    },
    validateStudentInput,
    validateAcademicDetails,
    studentController.update
  );
  
  // Delete a student
  app.delete('/api/students/:id', studentController.delete);
};
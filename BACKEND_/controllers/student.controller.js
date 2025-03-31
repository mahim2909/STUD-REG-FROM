const Student = require('../models/student.model');
const fs = require('fs');
const path = require('path');

// Helper function to handle file deletion
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Create a new student
exports.create = async (req, res) => {
  try {
    // Extract student data from request body
    const studentData = {
      salutation: req.body.salutation,
      first_name: req.body.first_name,
      middle_name: req.body.middle_name || null,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      country_code: req.body.country_code || '+91',
      phone_number: req.body.phone_number,
      email: req.body.email,
      current_address_line1: req.body.current_address_line1,
      current_address_line2: req.body.current_address_line2 || null,
      current_landmark: req.body.current_landmark || null,
      current_pincode: req.body.current_pincode,
      current_state: req.body.current_state,
      current_district: req.body.current_district,
      current_block: req.body.current_block,
      same_as_current: req.body.same_as_current === 'true',
      permanent_address_line1: req.body.permanent_address_line1,
      permanent_address_line2: req.body.permanent_address_line2 || null,
      permanent_landmark: req.body.permanent_landmark || null,
      permanent_pincode: req.body.permanent_pincode,
      permanent_state: req.body.permanent_state,
      permanent_district: req.body.permanent_district,
      permanent_block: req.body.permanent_block,
      profile_picture: req.files.profile_picture[0].path.replace(/\\/g, '/'),
      resume: req.files.resume[0].path.replace(/\\/g, '/'),
      signature: req.files.signature[0].path.replace(/\\/g, '/')
    };
    
    // Prepare academic details
    const academicData = req.validatedAcademicDetails.map((detail, index) => {
      const examTypes = ['10th', '12th', 'Graduation'];
      const marksheetFile = req.files[`marksheet_${examTypes[index].toLowerCase()}`][0];
      
      return {
        exam_type: examTypes[index],
        board_university: detail.board_university,
        stream: detail.stream,
        total_marks: parseFloat(detail.total_marks),
        obtained_marks: parseFloat(detail.obtained_marks),
        percentage: (parseFloat(detail.obtained_marks) / parseFloat(detail.total_marks) * 100).toFixed(2),
        marksheet: marksheetFile.path.replace(/\\/g, '/')
      };
    });
    
    // Save student to database
    const studentId = await Student.create(studentData, academicData);
    
    res.status(201).json({
      message: 'Student registered successfully!',
      studentId: studentId
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Some error occurred while registering the student.'
    });
  }
};

// Retrieve all students
exports.findAll = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Some error occurred while retrieving students.'
    });
  }
};

// Find a single student by ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({
        message: `Student with id ${id} not found.`
      });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error retrieving student.'
    });
  }
};

// Update a student
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get existing student to handle file updates
    const existingStudent = await Student.findById(id);
    
    if (!existingStudent) {
      return res.status(404).json({
        message: `Student with id ${id} not found.`
      });
    }
    
    // Extract student data from request body
    const studentData = {
      salutation: req.body.salutation,
      first_name: req.body.first_name,
      middle_name: req.body.middle_name || null,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      country_code: req.body.country_code || '+91',
      phone_number: req.body.phone_number,
      email: req.body.email,
      current_address_line1: req.body.current_address_line1,
      current_address_line2: req.body.current_address_line2 || null,
      current_landmark: req.body.current_landmark || null,
      current_pincode: req.body.current_pincode,
      current_state: req.body.current_state,
      current_district: req.body.current_district,
      current_block: req.body.current_block,
      same_as_current: req.body.same_as_current === 'true',
      permanent_address_line1: req.body.permanent_address_line1,
      permanent_address_line2: req.body.permanent_address_line2 || null,
      permanent_landmark: req.body.permanent_landmark || null,
      permanent_pincode: req.body.permanent_pincode,
      permanent_state: req.body.permanent_state,
      permanent_district: req.body.permanent_district,
      permanent_block: req.body.permanent_block
    };
    
    // Handle file updates if new files are provided
    if (req.files) {
      if (req.files.profile_picture) {
        // Delete old file
        deleteFile(path.join(__dirname, '..', existingStudent.profile_picture));
        // Update with new file
        studentData.profile_picture = req.files.profile_picture[0].path.replace(/\\/g, '/');
      }
      
      if (req.files.resume) {
        deleteFile(path.join(__dirname, '..', existingStudent.resume));
        studentData.resume = req.files.resume[0].path.replace(/\\/g, '/');
      }
      
      if (req.files.signature) {
        deleteFile(path.join(__dirname, '..', existingStudent.signature));
        studentData.signature = req.files.signature[0].path.replace(/\\/g, '/');
      }
    }
    
    // Prepare academic details
    const academicData = req.validatedAcademicDetails.map((detail, index) => {
        const examTypes = ['10th', '12th', 'Graduation'];
        const existingAcademic = existingStudent.academics.find(
          a => a.exam_type === examTypes[index]
        );
        
        const academic = {
          exam_type: examTypes[index],
          board_university: detail.board_university,
          stream: detail.stream,
          total_marks: parseFloat(detail.total_marks),
          obtained_marks: parseFloat(detail.obtained_marks),
          percentage: (parseFloat(detail.obtained_marks) / parseFloat(detail.total_marks) * 100).toFixed(2)
        };
        
        // Handle marksheet file if provided
        if (req.files && req.files[`marksheet_${examTypes[index].toLowerCase()}`]) {
          if (existingAcademic) {
            deleteFile(path.join(__dirname, '..', existingAcademic.marksheet));
          }
          academic.marksheet = req.files[`marksheet_${examTypes[index].toLowerCase()}`][0].path.replace(/\\/g, '/');
        } else if (existingAcademic) {
          academic.marksheet = existingAcademic.marksheet;
        }
        
        return academic;
      });
      
      // Update student in database
      await Student.update(id, studentData, academicData);
      
      res.json({
        message: 'Student updated successfully!'
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Some error occurred while updating the student.'
      });
    }
  };
  
  // Delete a student
  exports.delete = async (req, res) => {
    try {
      const id = req.params.id;
      
      // Get student before deleting to remove files
      const student = await Student.findById(id);
      
      if (!student) {
        return res.status(404).json({
          message: `Student with id ${id} not found.`
        });
      }
      
      // Delete associated files
      deleteFile(path.join(__dirname, '..', student.profile_picture));
      deleteFile(path.join(__dirname, '..', student.resume));
      deleteFile(path.join(__dirname, '..', student.signature));
      
      student.academics.forEach(academic => {
        deleteFile(path.join(__dirname, '..', academic.marksheet));
      });
      
      // Delete student from database
      const result = await Student.delete(id);
      
      if (result) {
        res.json({
          message: 'Student deleted successfully!'
        });
      } else {
        res.status(500).json({
          message: `Could not delete student with id ${id}.`
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Some error occurred while deleting the student.'
      });
    }
  };
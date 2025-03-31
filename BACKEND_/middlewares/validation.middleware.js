// Validation middleware
const validateStudentInput = (req, res, next) => {
    const { 
      salutation, first_name, last_name, date_of_birth, gender, 
      country_code, phone_number, email, current_address_line1, 
      current_pincode, current_state, current_district, current_block,
      permanent_address_line1, permanent_pincode, permanent_state, 
      permanent_district, permanent_block
    } = req.body;
    
    const errors = [];
    
    // Required fields validation
    if (!salutation) errors.push('Salutation is required');
    if (!first_name) errors.push('First name is required');
    if (!last_name) errors.push('Last name is required');
    if (!date_of_birth) errors.push('Date of birth is required');
    if (!gender) errors.push('Gender is required');
    if (!country_code) errors.push('Country code is required');
    if (!phone_number) errors.push('Phone number is required');
    if (!email) errors.push('Email is required');
    if (!current_address_line1) errors.push('Current address line 1 is required');
    if (!current_pincode) errors.push('Current PIN code is required');
    if (!current_state) errors.push('Current state is required');
    if (!current_district) errors.push('Current district is required');
    if (!current_block) errors.push('Current block is required');
    if (!permanent_address_line1) errors.push('Permanent address line 1 is required');
    if (!permanent_pincode) errors.push('Permanent PIN code is required');
    if (!permanent_state) errors.push('Permanent state is required');
    if (!permanent_district) errors.push('Permanent district is required');
    if (!permanent_block) errors.push('Permanent block is required');
    
    // Format validations
    const nameRegex = /^[A-Za-z\s]+$/;
    if (first_name && !nameRegex.test(first_name)) {
      errors.push('First name must contain only letters');
    }
    if (middle_name && !nameRegex.test(middle_name)) {
      errors.push('Middle name must contain only letters');
    }
    if (last_name && !nameRegex.test(last_name)) {
      errors.push('Last name must contain only letters');
    }
    
    // Date of birth validation
    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      const today = new Date();
      if (dob >= today) {
        errors.push('Date of birth must be in the past');
      }
    }
    
    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (phone_number && !phoneRegex.test(phone_number)) {
      errors.push('Phone number must contain exactly 10 digits');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
    
    // Check for files in create operation (not in update)
    if (!req.path.includes('update')) {
      if (!req.files || !req.files.profile_picture) {
        errors.push('Profile picture is required');
      }
      if (!req.files || !req.files.resume) {
        errors.push('Resume is required');
      }
      if (!req.files || !req.files.signature) {
        errors.push('Signature is required');
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    next();
  };
  
  // Validate academic details
  const validateAcademicDetails = (req, res, next) => {
    try {
      let academicDetails;
      
      // Parse JSON string if necessary
      if (typeof req.body.academicDetails === 'string') {
        academicDetails = JSON.parse(req.body.academicDetails);
      } else {
        academicDetails = req.body.academicDetails;
      }
      
      if (!Array.isArray(academicDetails) || academicDetails.length < 3) {
        return res.status(400).json({
          errors: ['All academic details (10th, 12th, and Graduation) are required']
        });
      }
      
      const errors = [];
      
      academicDetails.forEach((detail, index) => {
        if (!detail.board_university) {
          errors.push(`Board/University is required for record ${index + 1}`);
        }
        if (!detail.stream) {
          errors.push(`Stream is required for record ${index + 1}`);
        }
        if (!detail.total_marks) {
          errors.push(`Total marks are required for record ${index + 1}`);
        }
        if (!detail.obtained_marks) {
          errors.push(`Obtained marks are required for record ${index + 1}`);
        }
        
        // Validate marks
        if (parseFloat(detail.obtained_marks) > parseFloat(detail.total_marks)) {
          errors.push(`Obtained marks cannot be greater than total marks for record ${index + 1}`);
        }
      });
      
      // Check for marksheet files in create operation (not in update)
      if (!req.path.includes('update')) {
        if (!req.files || !req.files['marksheet_10th']) {
          errors.push('10th marksheet is required');
        }
        if (!req.files || !req.files['marksheet_12th']) {
          errors.push('12th marksheet is required');
        }
        if (!req.files || !req.files['marksheet_graduation']) {
          errors.push('Graduation marksheet is required');
        }
      }
      
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      // Attach validated academic details to request for controller use
      req.validatedAcademicDetails = academicDetails;
      next();
    } catch (error) {
      return res.status(400).json({
        errors: ['Invalid academic details format']
      });
    }
  };
  
  module.exports = {
    validateStudentInput,
    validateAcademicDetails
  };
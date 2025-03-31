const pool = require('../config/db.config');

// Student model
const Student = {
  // Create a new student
  create: async (studentData, academicData) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insert student basic data
      const [result] = await connection.query(
        'INSERT INTO students SET ?',
        studentData
      );
      
      const studentId = result.insertId;
      
      // Insert academic details
      for (const academic of academicData) {
        academic.student_id = studentId;
        await connection.query(
          'INSERT INTO academic_details SET ?',
          academic
        );
      }
      
      await connection.commit();
      return studentId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Find all students (with simplified data for table view)
  findAll: async () => {
    try {
      const [rows] = await pool.query(
        `SELECT id, salutation, CONCAT(first_name, ' ', IF(middle_name IS NULL OR middle_name = '', '', CONCAT(middle_name, ' ')), last_name) AS name, 
        phone_number, email FROM students`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Find a student by ID (with academic details)
  findById: async (id) => {
    try {
      const [studentRows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
      
      if (studentRows.length === 0) {
        return null;
      }
      
      const [academicRows] = await pool.query(
        'SELECT * FROM academic_details WHERE student_id = ?',
        [id]
      );
      
      return {
        ...studentRows[0],
        academics: academicRows
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Update a student
  update: async (id, studentData, academicData) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Update student basic data
      await connection.query(
        'UPDATE students SET ? WHERE id = ?',
        [studentData, id]
      );
      
      // Delete existing academic details
      await connection.query(
        'DELETE FROM academic_details WHERE student_id = ?',
        [id]
      );
      
      // Insert updated academic details
      for (const academic of academicData) {
        academic.student_id = id;
        await connection.query(
          'INSERT INTO academic_details SET ?',
          academic
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // Delete a student
  delete: async (id) => {
    try {
      // No need to delete academic_details separately due to ON DELETE CASCADE
      const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Student;
const pool = require('../config/db.config');

const Location = {
  // Get all states
  getStates: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM states ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get districts by state ID
  getDistrictsByState: async (stateId) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM districts WHERE state_id = ? ORDER BY name',
        [stateId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get blocks by district ID
  getBlocksByDistrict: async (districtId) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM blocks WHERE district_id = ? ORDER BY name',
        [districtId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Location;
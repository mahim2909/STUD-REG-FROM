const locationController = require('../controllers/location.controller');

module.exports = (app) => {
  // Get all states
  app.get('/api/states', locationController.getStates);
  
  // Get districts by state ID
  app.get('/api/districts/:stateId', locationController.getDistricts);
  
  // Get blocks by district ID
  app.get('/api/blocks/:districtId', locationController.getBlocks);
};
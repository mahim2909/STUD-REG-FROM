const Location = require('../models/location.model');

// Controller for location-related endpoints
exports.getStates = async (req, res) => {
  try {
    const states = await Location.getStates();
    res.json(states);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Some error occurred while retrieving states.'
    });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const stateId = req.params.stateId;
    const districts = await Location.getDistrictsByState(stateId);
    res.json(districts);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Some error occurred while retrieving districts.'
    });
  }
};

exports.getBlocks = async (req, res) => {
  try {
    const districtId = req.params.districtId;
    const blocks = await Location.getBlocksByDistrict(districtId);
    res.json(blocks);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Some error occurred while retrieving blocks.'
    });
  }
};
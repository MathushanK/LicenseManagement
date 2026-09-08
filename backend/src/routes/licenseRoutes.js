const express = require('express');
const {
  getAllLicensesFiltered,
  getAvailableLicenses,
  createLicense,
} = require('../controllers/licenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAllLicensesFiltered);
router.get('/available', protect, getAvailableLicenses);
router.post('/', protect, createLicense);

module.exports = router;
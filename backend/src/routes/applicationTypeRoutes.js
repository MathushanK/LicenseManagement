const express = require('express');
const { getAllApplicationTypes, createApplicationType } = require('../controllers/applicationTypeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAllApplicationTypes);
router.post('/', protect, createApplicationType);

module.exports = router;
const express = require('express');
const { getAllRequests, createRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAllRequests);
router.post('/', protect, createRequest);

module.exports = router;
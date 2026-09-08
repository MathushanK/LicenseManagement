const express = require('express');
const { getAllAssignments, createAssignment, updateAssignment, reassignAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAllAssignments);
router.post('/', protect, createAssignment);
router.patch('/:id', protect, updateAssignment);
router.post('/:id/reassign', protect, reassignAssignment);

module.exports = router;
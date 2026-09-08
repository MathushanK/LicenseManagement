const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { getUsers, createUser, getAudit } = require('../controllers/adminController');
const router = express.Router();
router.use(protect, adminOnly);
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/audit', getAudit);
module.exports = router;

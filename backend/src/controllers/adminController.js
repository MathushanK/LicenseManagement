const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getUsers = async (_req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, full_name, email, employee_no, role, created_at FROM users ORDER BY full_name');
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, employeeNo, role = 'USER' } = req.body;
    if (!username || !password || !fullName) return res.status(400).json({ success: false, message: 'Username, password and name are required' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (username,password,full_name,email,employee_no,role) VALUES (?,?,?,?,?,?)', [username, hash, fullName, email || null, employeeNo || null, role]);
    await db.query('INSERT INTO audit_logs (user_id, action, payload) VALUES (?, ?, ?)', [req.user.id, 'USER_CREATED', JSON.stringify({ userId: result.insertId, username })]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ success: false, message: err.code === 'ER_DUP_ENTRY' ? 'Username already exists' : err.message }); }
};

const getAudit = async (_req, res) => {
  try {
    const [logs] = await db.query('SELECT a.*, u.full_name FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 100');
    res.json({ success: true, data: logs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getUsers, createUser, getAudit };

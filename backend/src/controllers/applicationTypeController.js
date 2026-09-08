const db = require('../config/db');

const getAllApplicationTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM application_types ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createApplicationType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Application name is required' });
    }

    const [result] = await db.query('INSERT INTO application_types (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ success: true, data: { id: result.insertId, name: name.trim() } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This application already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllApplicationTypes, createApplicationType };
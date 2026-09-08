const db = require('../config/db');

const getAllRequests = async (req, res) => {
  try {
    const [requests] = await db.query('SELECT * FROM license_requests ORDER BY requested_at DESC');
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { requestedBy, requesterContact, purpose, oasysTicket, requestDetails, applicationType, uiFormSubmitted } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO license_requests 
       (requested_by, requester_contact, purpose, oasys_ticket, request_details, application_type, ui_form_submitted) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [requestedBy, requesterContact, purpose, oasysTicket, requestDetails, applicationType, uiFormSubmitted]
    );

    res.status(201).json({ success: true, message: 'Request created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllRequests, createRequest };
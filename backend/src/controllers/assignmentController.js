const db = require('../config/db');

const createAssignment = async (req, res) => {
  try {
    const { licenseId, requestId, assignedTo, fromDate, toDate } = req.body;
    const assignedBy = req.user.id;

    if (!licenseId || !assignedTo || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'License, assignee and dates are required' });
    }

    const [licenseRows] = await db.query(
      `SELECT
         l.total_quantity,
         COALESCE(a.assigned_count, 0) AS assigned,
         COALESCE(r.pending_count, 0) AS pending
       FROM licenses l
       LEFT JOIN (
         SELECT license_id, COUNT(*) AS assigned_count
         FROM assignments WHERE status = 'ASSIGNED' GROUP BY license_id
       ) a ON a.license_id = l.id
       LEFT JOIN (
         SELECT license_id, COUNT(*) AS pending_count
         FROM license_requests WHERE status = 'OPEN' AND license_id IS NOT NULL GROUP BY license_id
       ) r ON r.license_id = l.id
       WHERE l.id = ?`,
      [licenseId]
    );

    if (!licenseRows.length) {
      return res.status(404).json({ success: false, message: 'License not found' });
    }

    const license = licenseRows[0];
    const available = license.total_quantity - license.assigned - license.pending;
    if (available <= 0) {
      return res.status(400).json({ success: false, message: 'No seats available for this license' });
    }

    if (requestId) {
      const [openRequests] = await db.query("SELECT id FROM license_requests WHERE id = ? AND status = 'OPEN'", [requestId]);
      if (!openRequests.length) return res.status(400).json({ success: false, message: 'Only open requests can be assigned' });
    }

    await db.query(
      `INSERT INTO assignments (license_id, request_id, assigned_to, assigned_by, from_date, to_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [licenseId, requestId, assignedTo, assignedBy, fromDate, toDate]
    );

    if (requestId) await db.query("UPDATE license_requests SET status = 'APPROVED' WHERE id = ?", [requestId]);
    await db.query('INSERT INTO audit_logs (user_id, action, payload) VALUES (?, ?, ?)', [assignedBy, 'LICENSE_ASSIGNED', JSON.stringify({ licenseId, requestId, assignedTo })]);

    res.status(201).json({ success: true, message: 'License assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { assignedTo, status, toDate } = req.body;
    const [rows] = await db.query('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Assignment not found' });
    const assignment = rows[0];

    await db.query(
      'UPDATE assignments SET assigned_to = COALESCE(?, assigned_to), status = COALESCE(?, status), to_date = COALESCE(?, to_date) WHERE id = ?',
      [assignedTo || null, status || null, toDate || null, assignment.id]
    );

    await db.query('INSERT INTO audit_logs (user_id, action, payload) VALUES (?, ?, ?)', [req.user.id, 'ASSIGNMENT_UPDATED', JSON.stringify({ id: assignment.id, assignedTo, status, toDate })]);
    res.json({ success: true, message: 'Assignment updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/assignments/:id/reassign
// Changing WHO holds a license shouldn't overwrite history — it closes
// the current assignment row (UNASSIGNED, end-dated today) and opens a
// brand new row for the new assignee. This keeps a full paper trail of
// who held a given license and when, instead of losing the previous
// holder the moment someone edits the record.
const reassignAssignment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { assignedTo, toDate } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'New assignee is required' });
    }

    const [rows] = await connection.query('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Assignment not found' });
    const oldAssignment = rows[0];

    if (oldAssignment.status !== 'ASSIGNED') {
      return res.status(400).json({ success: false, message: 'Only active assignments can be reassigned' });
    }

    await connection.beginTransaction();

    const today = new Date().toISOString().slice(0, 10);

    // Close out the current holder's record
    await connection.query(
      "UPDATE assignments SET status = 'UNASSIGNED', to_date = ? WHERE id = ?",
      [today, oldAssignment.id]
    );

    // Open a fresh record for the new holder, same license
    const [insertResult] = await connection.query(
      `INSERT INTO assignments (license_id, request_id, assigned_to, assigned_by, from_date, to_date)
       VALUES (?, NULL, ?, ?, ?, ?)`,
      [oldAssignment.license_id, assignedTo, req.user.id, today, toDate || oldAssignment.to_date]
    );

    await connection.query(
      'INSERT INTO audit_logs (user_id, action, payload) VALUES (?, ?, ?)',
      [
        req.user.id,
        'ASSIGNMENT_REASSIGNED',
        JSON.stringify({
          licenseId: oldAssignment.license_id,
          previousAssignmentId: oldAssignment.id,
          previousAssignee: oldAssignment.assigned_to,
          newAssignmentId: insertResult.insertId,
          newAssignee: assignedTo,
        }),
      ]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: 'License reassigned successfully' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

const getAllAssignments = async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT a.*, l.license_name, u.full_name as assigned_to_name
      FROM assignments a
      JOIN licenses l ON a.license_id = l.id
      JOIN users u ON a.assigned_to = u.id
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createAssignment, getAllAssignments, updateAssignment, reassignAssignment };
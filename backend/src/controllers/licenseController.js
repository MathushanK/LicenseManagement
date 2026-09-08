const db = require('../config/db');

// Shared SELECT used by both the list and filtered endpoints.
// available/assigned/pending are computed, not stored, so they can
// never drift out of sync with the assignments/license_requests they
// come from.
const LICENSE_SELECT = `
  SELECT
    l.id,
    l.license_name,
    l.type,
    l.description,
    l.application_type,
    l.total_quantity,
    COALESCE(a.assigned_count, 0) AS assigned,
    COALESCE(r.pending_count, 0) AS pending,
    l.total_quantity - COALESCE(a.assigned_count, 0) - COALESCE(r.pending_count, 0) AS available
  FROM licenses l
  LEFT JOIN (
    SELECT license_id, COUNT(*) AS assigned_count
    FROM assignments
    WHERE status = 'ASSIGNED'
    GROUP BY license_id
  ) a ON a.license_id = l.id
  LEFT JOIN (
    SELECT license_id, COUNT(*) AS pending_count
    FROM license_requests
    WHERE status = 'OPEN' AND license_id IS NOT NULL
    GROUP BY license_id
  ) r ON r.license_id = l.id
`;

const getAllLicenses = async (req, res) => {
  try {
    const [licenses] = await db.query(LICENSE_SELECT);
    res.json({ success: true, data: licenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/licenses?application=Tableau&availability=AVAILABLE
// `availability=AVAILABLE` now means "available count > 0", since there's
// no per-row status column anymore.
const getAllLicensesFiltered = async (req, res) => {
  try {
    const { application, availability } = req.query;

    let query = `SELECT * FROM (${LICENSE_SELECT}) AS licenses_with_counts WHERE 1 = 1`;
    const params = [];

    if (application) {
      query += ' AND application_type = ?';
      params.push(application);
    }

    if (availability === 'AVAILABLE') {
      query += ' AND available > 0';
    }

    const [licenses] = await db.query(query, params);
    res.json({ success: true, data: licenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAvailableLicenses = async (req, res) => {
  try {
    const query = `SELECT * FROM (${LICENSE_SELECT}) AS licenses_with_counts WHERE available > 0`;
    const [licenses] = await db.query(query);
    res.json({ success: true, data: licenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/licenses
// Creates a new license *type* row with a total quantity — not an
// individual seat.
const createLicense = async (req, res) => {
  try {
    const { applicationType, licenseName, type, description, totalQuantity } = req.body;

    if (!applicationType || !licenseName || !type || !totalQuantity) {
      return res.status(400).json({
        success: false,
        message: 'applicationType, licenseName, type, and totalQuantity are required',
      });
    }

    const [result] = await db.query(
      `INSERT INTO licenses (license_name, type, description, application_type, total_quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [licenseName, type, description || null, applicationType, totalQuantity]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllLicenses,
  getAvailableLicenses,
  getAllLicensesFiltered,
  createLicense,
};
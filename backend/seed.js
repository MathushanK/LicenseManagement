const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.query(
      `INSERT INTO users (username, password, full_name, email, employee_no, role) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE password = VALUES(password)`,
      ['admin', hashedPassword, 'LECO Admin', 'admin@leco.lk', 'ADM001', 'ADMIN']
    );

    // Sample Users
    const users = [
      ['GEFKLABS', await bcrypt.hash('123456', 10), 'GEEK LABS', 'geeklabs@leco.lk', 'G-001', 'USER'],
      ['DEVINT1', await bcrypt.hash('123456', 10), 'DEV INT 1', 'devint1@leco.lk', 'D-001', 'USER'],
      ['J-111', await bcrypt.hash('123456', 10), 'LALITH JAYATHILAKE', 'j-111@leco.lk', 'J-111', 'OFFICER'],
    ];

    for (const user of users) {
      await db.query(
        `INSERT INTO users (username, password, full_name, email, employee_no, role) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
        user
      );
    }

    // Sample Licenses
    await db.query(`
      INSERT INTO licenses (license_name, type, description, availability) VALUES 
      ('Creator 01', 'CREATOR', 'Tableau Creator License 1', 'AVAILABLE'),
      ('Creator 02', 'CREATOR', 'Tableau Creator License 2', 'AVAILABLE'),
      ('Explorer 03', 'EXPLORER', 'Tableau Explorer License', 'AVAILABLE'),
      ('Server Admin 01', 'SERVER_ADMIN', 'Server Admin License', 'AVAILABLE'),
      ('Viewer 100', 'VIEWER', 'Viewer License', 'AVAILABLE')
      ON DUPLICATE KEY UPDATE license_name = VALUES(license_name);
    `);

    // Sample Requests
    await db.query(`
      INSERT INTO license_requests 
      (requested_by, requester_contact, purpose, oasys_ticket, request_details, status) 
      VALUES 
      ('GEEKLABS', 'geek@leco.lk', 'Development', '0', 'Need for new dashboard', 'APPROVED'),
      ('DEVINT1', 'devint@leco.lk', 'Dahboard Development for Trainee', '0', 'Training purpose', 'OPEN')
      ON DUPLICATE KEY UPDATE requested_by = VALUES(requested_by);
    `);

    console.log('✅ Seed data inserted successfully!');
    console.log('Admin Login → Username: admin | Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
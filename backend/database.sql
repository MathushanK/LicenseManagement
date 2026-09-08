CREATE DATABASE IF NOT EXISTS leco_license_db;
USE leco_license_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    employee_no VARCHAR(50),
    role ENUM('ADMIN', 'USER', 'OFFICER') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_name VARCHAR(100) NOT NULL,
    type ENUM('CREATOR','EXPLORER','VIEWER','SERVER_ADMIN','SITE_ADMIN') NOT NULL,
    description TEXT,
    availability ENUM('AVAILABLE','ASSIGNED') DEFAULT 'AVAILABLE',
    assigned_to INT NULL,
    application_type VARCHAR(50) DEFAULT 'Tableau',
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (application_type) REFERENCES application_types(id)
);

CREATE TABLE license_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requested_by VARCHAR(50) NOT NULL,
    requester_contact VARCHAR(100),
    purpose VARCHAR(255),
    oasys_ticket VARCHAR(50),
    request_details TEXT,
    application_type VARCHAR(50) DEFAULT 'Tableau',
    ui_form_submitted BOOLEAN DEFAULT FALSE,
    status ENUM('OPEN','APPROVED','REJECTED') DEFAULT 'OPEN',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_id INT NOT NULL,
    request_id INT NULL,
    assigned_to INT NOT NULL,
    assigned_by INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    status ENUM('ASSIGNED','UNASSIGNED','EXPIRED') DEFAULT 'ASSIGNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (license_id) REFERENCES licenses(id),
    FOREIGN KEY (request_id) REFERENCES license_requests(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    payload JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
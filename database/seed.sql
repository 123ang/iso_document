-- ISO Document Management System - Seed Data
-- This script creates initial admin user and sample data

-- ============================================
-- Initial Admin User
-- ============================================
-- Password: Admin@123
-- Note: This is a bcrypt hash with 10 rounds
INSERT INTO users (name, email, password_hash, role) VALUES
('System Administrator', 'admin@example.com', '$2b$10$X5x7.BXD7MHvHZK3t7p4EO3LH9v7lJK4h2LmH5xQqR3K4x5C6v7Ty', 'admin');

-- ============================================
-- Sample Groups
-- ============================================
INSERT INTO `groups` (name, description) VALUES
('Management', 'Senior management and executives'),
('Quality Assurance', 'Quality assurance and ISO compliance team'),
('All Staff', 'All company staff members'),
('Auditors', 'Internal and external auditors');

-- ============================================
-- Assign Admin to All Groups (for testing)
-- ============================================
INSERT INTO user_groups (user_id, group_id)
SELECT 1, id FROM `groups`;

-- ============================================
-- Sample Document Sets
-- ============================================
INSERT INTO document_sets (title, category, description, sort_order, created_by) VALUES
('ISO 9001:2015', 'Quality Management', 'ISO 9001:2015 Quality Management System documentation', 1, 1),
('Internal Audit', 'Audit', 'Internal audit reports and findings', 2, 1),
('Meeting Minutes', 'Administration', 'Management and departmental meeting minutes', 3, 1),
('Online Documents', 'General', 'Publicly accessible company documents', 4, 1);

-- ============================================
-- Assign Document Sets to Groups
-- ============================================
-- ISO 9001:2015 - accessible by Management, QA, and Auditors
INSERT INTO document_set_groups (document_set_id, group_id) VALUES
(1, 1), -- Management
(1, 2), -- Quality Assurance
(1, 4); -- Auditors

-- Internal Audit - accessible by Management and Auditors
INSERT INTO document_set_groups (document_set_id, group_id) VALUES
(2, 1), -- Management
(2, 4); -- Auditors

-- Meeting Minutes - accessible by Management and All Staff
INSERT INTO document_set_groups (document_set_id, group_id) VALUES
(3, 1), -- Management
(3, 3); -- All Staff

-- Online Documents - accessible by everyone
INSERT INTO document_set_groups (document_set_id, group_id) VALUES
(4, 1), -- Management
(4, 2), -- Quality Assurance
(4, 3), -- All Staff
(4, 4); -- Auditors

-- ============================================
-- Sample Documents (without files - for structure demo)
-- ============================================
INSERT INTO documents (document_set_id, title, doc_code, created_by) VALUES
(1, 'Quality Manual', 'QM-001', 1),
(1, 'Document Control Procedure', 'QP-001', 1),
(2, 'Internal Audit Plan 2024', 'IA-2024-001', 1),
(3, 'Management Review Meeting Jan 2024', 'MRM-2024-01', 1),
(4, 'Company Organization Chart', 'GD-001', 1);

-- ============================================
-- Initial Audit Log Entry
-- ============================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'SEED_DATABASE', 'SYSTEM', NULL, JSON_OBJECT('message', 'Database initialized with seed data'));

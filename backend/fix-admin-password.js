#!/usr/bin/env node
// Script to fix admin and demo user passwords
// Usage: node fix-admin-password.js

// Try to load .env file if dotenv is available, otherwise use defaults
try {
  require('dotenv').config({ path: '.env' });
} catch (e) {
  // dotenv not available, will use defaults or environment variables
}

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixPasswords() {
  console.log('🔧 Fixing admin and demo user passwords...\n');
  
  // Get database config from .env or use defaults
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env');
  const hasEnvFile = fs.existsSync(envPath);
  
  // Check if running on server (production) or local (development)
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.platform === 'linux' && process.env.USER === 'root';
  
  // Get database config from .env or use defaults
  // For production server: iso_user / 5792_Ang
  // For local development: root / empty (XAMPP) or your local credentials
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || (isProduction ? 'iso_user' : 'root'),
    password: process.env.DB_PASSWORD || (isProduction ? '5792_Ang' : ''),
    database: process.env.DB_DATABASE || 'iso_document_system',
  };

  // Show configuration info
  if (hasEnvFile) {
    console.log('📄 Using .env file configuration');
  } else {
    console.log('⚠️  No .env file found, using defaults');
    if (isProduction) {
      console.log('   Assuming production server (iso_user)');
    } else {
      console.log('   Assuming local development (root)');
    }
  }

  console.log('📋 Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}\n`);

  let connection;
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // Generate password hashes
    console.log('🔐 Generating password hashes...');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const demoHash = await bcrypt.hash('Demo@123', 10);
    console.log('✅ Password hashes generated\n');

    // Check if users exist
    console.log('👤 Checking existing users...');
    const [adminUsers] = await connection.execute(
      'SELECT id, email, name, role FROM users WHERE email = ?',
      ['admin@example.com']
    );
    
    const [demoUsers] = await connection.execute(
      'SELECT id, email, name, role FROM users WHERE email = ?',
      ['demo@example.com']
    );

    if (adminUsers.length === 0) {
      console.log('⚠️  Admin user not found. Creating admin user...');
      await connection.execute(
        `INSERT INTO users (name, email, password_hash, role, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
        ['System Administrator', 'admin@example.com', adminHash, 'admin', true]
      );
      console.log('✅ Admin user created\n');
    } else {
      console.log('✅ Admin user found, updating password...');
      await connection.execute(
        'UPDATE users SET password_hash = ?, is_active = true WHERE email = ?',
        [adminHash, 'admin@example.com']
      );
      console.log('✅ Admin password updated\n');
    }

    if (demoUsers.length === 0) {
      console.log('⚠️  Demo user not found. Creating demo user...');
      await connection.execute(
        `INSERT INTO users (name, email, password_hash, role, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Demo User', 'demo@example.com', demoHash, 'user', true]
      );
      console.log('✅ Demo user created\n');
    } else {
      console.log('✅ Demo user found, updating password...');
      await connection.execute(
        'UPDATE users SET password_hash = ?, is_active = true WHERE email = ?',
        [demoHash, 'demo@example.com']
      );
      console.log('✅ Demo password updated\n');
    }

    // Verify updates
    console.log('✅ Verifying updates...\n');
    const [updatedAdmin] = await connection.execute(
      'SELECT id, email, name, role, is_active FROM users WHERE email = ?',
      ['admin@example.com']
    );
    
    const [updatedDemo] = await connection.execute(
      'SELECT id, email, name, role, is_active FROM users WHERE email = ?',
      ['demo@example.com']
    );

    if (updatedAdmin.length > 0) {
      const admin = updatedAdmin[0];
      console.log('📋 Admin User:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.is_active ? 'Yes' : 'No'}`);
      console.log(`   Password: Admin@123\n`);
    }

    if (updatedDemo.length > 0) {
      const demo = updatedDemo[0];
      console.log('📋 Demo User:');
      console.log(`   ID: ${demo.id}`);
      console.log(`   Email: ${demo.email}`);
      console.log(`   Name: ${demo.name}`);
      console.log(`   Role: ${demo.role}`);
      console.log(`   Active: ${demo.is_active ? 'Yes' : 'No'}`);
      console.log(`   Password: Demo@123\n`);
    }

    // Test password verification
    console.log('🧪 Testing password verification...');
    const [testAdmin] = await connection.execute(
      'SELECT password_hash FROM users WHERE email = ?',
      ['admin@example.com']
    );
    
    if (testAdmin.length > 0) {
      const isValid = await bcrypt.compare('Admin@123', testAdmin[0].password_hash);
      if (isValid) {
        console.log('✅ Admin password verification: SUCCESS\n');
      } else {
        console.log('❌ Admin password verification: FAILED\n');
      }
    }

    await connection.end();
    
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ SUCCESS! Passwords have been fixed.');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📝 Login Credentials:');
    console.log('');
    console.log('🔐 Admin Account:');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin@123');
    console.log('');
    console.log('👤 Demo Account:');
    console.log('   Email: demo@example.com');
    console.log('   Password: Demo@123');
    console.log('');
    console.log('🌐 Try logging in at: https://iso.taskinsight.my/login');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    if (connection) {
      await connection.end();
    }
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    
    if (error.message.includes('Access denied')) {
      console.error('   Authentication failed. Check your database credentials:');
      console.error(`   - User: ${config.user}`);
      console.error(`   - Host: ${config.host}`);
      console.error(`   - Database: ${config.database}`);
      console.error('');
      console.error('   If running locally (Windows/XAMPP):');
      console.error('   - Check your local .env file in backend directory');
      console.error('   - For XAMPP, user is usually "root" with empty password');
      console.error('');
      console.error('   If running on production server:');
      console.error('   - Ensure .env file has correct DB_USERNAME and DB_PASSWORD');
      console.error('   - Default should be: iso_user / 5792_Ang');
      console.error('');
      console.error('   To fix: Create or update backend/.env file with:');
      console.error('   DB_HOST=localhost');
      console.error('   DB_PORT=3306');
      console.error('   DB_USERNAME=iso_user  (or root for local)');
      console.error('   DB_PASSWORD=5792_Ang  (or your password, empty for XAMPP)');
      console.error('   DB_DATABASE=iso_document_system');
    } else {
      console.error('   1. Check if .env file exists in backend directory');
      console.error('   2. Verify database credentials in .env file');
      console.error('   3. Ensure database is running');
      console.error('   4. Verify database and user exist');
    }
    console.error('');
    process.exit(1);
  }
}

// Run the script
fixPasswords();

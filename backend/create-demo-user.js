// Script to create a demo user account
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createDemoUser() {
  console.log('🎭 Creating demo user account...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'iso_document_system',
  };

  // Demo user credentials
  const demoUser = {
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'Demo@123',
    role: 'user',
  };

  try {
    // Connect to database
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // Check if demo user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [demoUser.email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Demo user already exists!');
      console.log(`   Email: ${demoUser.email}`);
      console.log(`   Updating password...\n`);
      
      // Update password
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);
      await connection.execute(
        'UPDATE users SET password_hash = ?, is_active = 1 WHERE email = ?',
        [hashedPassword, demoUser.email]
      );
      
      console.log('✅ Demo user password updated!\n');
    } else {
      // Hash the password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);
      console.log('✅ Password hashed\n');

      // Insert new user
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
        [demoUser.name, demoUser.email, hashedPassword, demoUser.role, 1]
      );

      const userId = result.insertId;
      console.log(`✅ Demo user created with ID: ${userId}\n`);

      // Assign to "All Staff" group (assuming it exists with ID 3)
      await connection.execute(
        'INSERT INTO user_groups (user_id, group_id) SELECT ?, id FROM `groups` WHERE name = "All Staff"',
        [userId]
      );
      console.log('✅ Assigned to "All Staff" group\n');
    }

    // Get all groups for the demo user
    const [userGroups] = await connection.execute(
      `SELECT g.name 
       FROM user_groups ug 
       JOIN \`groups\` g ON g.id = ug.group_id 
       JOIN users u ON u.id = ug.user_id 
       WHERE u.email = ?`,
      [demoUser.email]
    );

    await connection.end();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Demo User Account Ready!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📧 Email:    ', demoUser.email);
    console.log('🔐 Password: ', demoUser.password);
    console.log('👤 Role:     ', demoUser.role.toUpperCase());
    console.log('📁 Groups:   ', userGroups.map(g => g.name).join(', ') || 'None');
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎯 Permissions:');
    console.log('   ✅ View documents in assigned groups');
    console.log('   ✅ Download current versions');
    console.log('   ✅ Search documents');
    console.log('   ❌ Cannot upload or modify documents');
    console.log('   ❌ No admin access');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🚀 Test it now at: http://localhost:3001\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDemoUser();

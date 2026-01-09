// Script to fix admin password
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixPassword() {
  console.log('🔧 Fixing admin password...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'iso_document_system',
  };

  const email = 'admin@example.com';
  const newPassword = 'Admin@123';

  try {
    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed\n');

    // Connect to database
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // Update password
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, email]
    );

    console.log(`✅ Password updated for ${email}`);
    console.log(`   New password: ${newPassword}\n`);

    // Verify
    const [users] = await connection.execute(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email]
    );

    if (users.length > 0) {
      console.log('✅ User verified:');
      console.log(`   ID: ${users[0].id}`);
      console.log(`   Email: ${users[0].email}`);
      console.log(`   Name: ${users[0].name}\n`);
    }

    await connection.end();
    console.log('✅ Done! You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPassword();

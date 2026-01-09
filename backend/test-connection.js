// Quick database connection test
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'iso_document_system',
  };

  console.log('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Password: ${config.password ? '***' : '(empty)'}`);
  console.log(`  Database: ${config.database}\n`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful!\n');

    // Test if users table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length > 0) {
      console.log('✅ Users table exists\n');
      
      // Check if admin user exists
      const [users] = await connection.execute(
        "SELECT id, email, name, role FROM users WHERE email = ?",
        ['admin@example.com']
      );
      
      if (users.length > 0) {
        console.log('✅ Admin user found:');
        console.log(`   ID: ${users[0].id}`);
        console.log(`   Email: ${users[0].email}`);
        console.log(`   Name: ${users[0].name}`);
        console.log(`   Role: ${users[0].role}\n`);
      } else {
        console.log('⚠️  Admin user not found. Run seed.sql\n');
      }
    } else {
      console.log('⚠️  Users table not found. Run schema.sql\n');
    }

    await connection.end();
    console.log('✅ All checks passed!');
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check if MySQL is running (XAMPP Control Panel)');
    console.error('2. Verify database exists: CREATE DATABASE iso_document_system;');
    console.error('3. Check credentials in backend/.env');
    console.error('4. Run: mysql -u root -p < database/schema.sql');
    process.exit(1);
  }
}

testConnection();

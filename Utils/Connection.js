const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,  // Your Login ID
    password: process.env.DB_PASSWORD,  // Your Password
    server: process.env.DB_SERVER,  // Your SQL Server name (e.g., localhost or IP address)
    database: process.env.DB_DATABASE,  // The name of the database you want to connect to
    options: {
        encrypt: true, // Use true if you're connecting to Azure
        trustServerCertificate: true // Set to true for local dev / self-signed certs
    }
};

const connectDB = async () => {
  try {
    let pool = await sql.connect(config);
    console.log("DB Connected")
    return pool;
  } catch(e) {
    console.log(e);
  }
}

module.exports = {
  connectDB,
  sql,
};

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initDB() {
  try {
    await pool.query('SELECT 1');
    console.log('[auth-service] PostgreSQL connected');
  } catch (err) {
    console.error('[auth-service] DB connection error:', err.message);
    throw err;
  }
}

module.exports = { pool, initDB };
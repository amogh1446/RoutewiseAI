import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Helper to check DB connection
export const checkDbConnection = async (): Promise<boolean> => {
  if (!process.env.DATABASE_URL) {
    // Return true for the initial MVP stage before DB is set up,
    // or log that it's skipped.
    console.log('DATABASE_URL not set, skipping DB connection check.');
    return true; 
  }

  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

import '../env.js';
import pkg from 'pg';
const { Pool } = pkg;

// Pool configuration from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '30000', 10),
});

export { pool };

// Generic query helper — wraps pool.query with consistent error logging
export const query = async <T extends pkg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pkg.QueryResult<T>> => {
  const result = await pool.query<T>(text, params);
  return result;
};

// Check basic database connectivity
export const checkDbConnection = async (): Promise<boolean> => {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set, skipping DB connection check.');
    return false;
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

// Verify PostGIS extension is installed and return version
export const checkPostGIS = async (): Promise<string | null> => {
  try {
    const result = await query<{ postgis_version: string }>(
      'SELECT PostGIS_Version() AS postgis_version'
    );
    return result.rows[0]?.postgis_version ?? null;
  } catch {
    return null;
  }
};

// Check how many states are loaded in the database
export const checkStatesLoaded = async (): Promise<number> => {
  try {
    const result = await query<{ count: string }>('SELECT COUNT(*) AS count FROM states');
    return parseInt(result.rows[0]?.count ?? '0', 10);
  } catch {
    return 0;
  }
};

// Run startup verification and log results
export const verifyDatabase = async (): Promise<void> => {
  const connected = await checkDbConnection();
  if (!connected) {
    console.warn('[DB] ⚠ Database not connected. Geographic features will be unavailable.');
    return;
  }
  console.log('[DB] ✓ Database connected.');

  const postgisVersion = await checkPostGIS();
  if (!postgisVersion) {
    console.warn('[DB] ⚠ PostGIS extension not found. Spatial queries will fail.');
    return;
  }
  console.log(`[DB] ✓ PostGIS ${postgisVersion}`);

  const stateCount = await checkStatesLoaded();
  if (stateCount === 0) {
    console.warn('[DB] ⚠ No states loaded. Run migrations: npm run db:migrate');
  } else {
    console.log(`[DB] ✓ ${stateCount} states loaded.`);
  }
};

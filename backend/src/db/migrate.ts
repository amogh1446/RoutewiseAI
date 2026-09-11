import '../env.js';
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const MIGRATIONS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS _migrations (
    id          SERIAL PRIMARY KEY,
    filename    VARCHAR(255) NOT NULL UNIQUE,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

async function runMigrations(reset: boolean = false): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Migrate] ERROR: DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('[Migrate] Connected to database.');

    if (reset) {
      console.log('[Migrate] Resetting database — dropping all tables...');
      // Drop all tables in reverse dependency order
      await client.query(`
        DROP TABLE IF EXISTS trip_stops CASCADE;
        DROP TABLE IF EXISTS trip_days CASCADE;
        DROP TABLE IF EXISTS trips CASCADE;
        DROP TABLE IF EXISTS routes CASCADE;
        DROP TABLE IF EXISTS poi_tags CASCADE;
        DROP TABLE IF EXISTS pois CASCADE;
        DROP TABLE IF EXISTS states CASCADE;
        DROP TABLE IF EXISTS _migrations CASCADE;
      `);
      console.log('[Migrate] All tables dropped.');
    }

    // Ensure migrations tracking table exists
    await client.query(MIGRATIONS_TABLE_SQL);

    // Read migration files sorted alphabetically
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('[Migrate] No migrations directory found. Nothing to run.');
      return;
    }

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('[Migrate] No migration files found.');
      return;
    }

    // Check which migrations have already been applied
    const applied = await client.query<{ filename: string }>(
      'SELECT filename FROM _migrations ORDER BY id'
    );
    const appliedSet = new Set(applied.rows.map(r => r.filename));

    let appliedCount = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[Migrate] ⏭ ${file} (already applied)`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`[Migrate] ▶ Applying ${file}...`);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`[Migrate] ✓ ${file} applied successfully.`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[Migrate] ✗ FAILED on ${file}:`);
        console.error(err);
        process.exit(1);
      }
    }

    if (appliedCount === 0) {
      console.log('[Migrate] Database is up to date. No new migrations.');
    } else {
      console.log(`[Migrate] Done. ${appliedCount} migration(s) applied.`);
    }

  } catch (err) {
    console.error('[Migrate] Connection error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Parse CLI args
const args = process.argv.slice(2);
const reset = args.includes('--reset');

runMigrations(reset);

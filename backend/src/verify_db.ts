import './env.js';
import { Client } from 'pg';

async function verify() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const results: { check: string; status: string; detail: string }[] = [];

  // 1. States count
  const r1 = await client.query('SELECT COUNT(*)::int AS cnt FROM states');
  const cnt = r1.rows[0].cnt;
  results.push({ check: '1. States count = 36', status: cnt === 36 ? 'PASS' : 'FAIL', detail: `Found ${cnt}` });

  // 2. Exactly 5 MVP states have non-null boundaries
  const r2 = await client.query(`
    SELECT name FROM states WHERE boundary IS NOT NULL ORDER BY name
  `);
  const withBoundary = r2.rows.map((r: any) => r.name);
  const expected = ['Goa', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan'];
  const match = JSON.stringify(withBoundary) === JSON.stringify(expected);
  results.push({ check: '2. Exactly 5 MVP states have boundaries', status: match ? 'PASS' : 'FAIL', detail: withBoundary.join(', ') });

  // 3. Geometry type, SRID, validity
  const r3 = await client.query(`
    SELECT
      name,
      ST_GeometryType(boundary) AS geom_type,
      ST_SRID(boundary) AS srid,
      ST_IsValid(boundary) AS is_valid
    FROM states
    WHERE boundary IS NOT NULL
    ORDER BY name
  `);
  for (const row of r3.rows) {
    const typeOk = row.geom_type === 'ST_MultiPolygon';
    const sridOk = row.srid === 4326;
    const validOk = row.is_valid === true;
    const allOk = typeOk && sridOk && validOk;
    results.push({
      check: `3. ${row.name} geometry`,
      status: allOk ? 'PASS' : 'FAIL',
      detail: `type=${row.geom_type} srid=${row.srid} valid=${row.is_valid}`
    });
  }

  // 4. Migrations table
  const r4 = await client.query('SELECT filename FROM _migrations ORDER BY filename');
  const migrations = r4.rows.map((r: any) => r.filename);
  const has001 = migrations.includes('001_create_tables.sql');
  const has002 = migrations.includes('002_seed_states.sql');
  results.push({ check: '4. _migrations contains both files', status: has001 && has002 ? 'PASS' : 'FAIL', detail: migrations.join(', ') });

  // 5. All 7 MVP tables exist
  const expectedTables = ['states', 'pois', 'poi_tags', 'routes', 'trips', 'trip_days', 'trip_stops'];
  const r5 = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  const existing = r5.rows.map((r: any) => r.table_name);
  for (const t of expectedTables) {
    results.push({ check: `5. Table "${t}" exists`, status: existing.includes(t) ? 'PASS' : 'FAIL', detail: existing.includes(t) ? 'EXISTS' : 'MISSING' });
  }

  // 6. Foreign key and index health
  // 6a. FK constraints
  const r6a = await client.query(`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table,
      ccu.column_name AS foreign_column,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `);
  results.push({ check: '6a. Foreign keys defined', status: r6a.rows.length > 0 ? 'PASS' : 'FAIL', detail: `${r6a.rows.length} FK constraints found` });
  for (const fk of r6a.rows) {
    // verify referenced table exists
    const refExists = existing.includes(fk.foreign_table);
    results.push({
      check: `6a. FK ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table}.${fk.foreign_column}`,
      status: refExists ? 'PASS' : 'FAIL',
      detail: refExists ? 'OK' : 'Referenced table missing'
    });
  }

  // 6b. Indexes
  const r6b = await client.query(`
    SELECT tablename, indexname FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `);
  results.push({ check: '6b. Indexes present', status: r6b.rows.length > 0 ? 'PASS' : 'FAIL', detail: `${r6b.rows.length} indexes found` });

  // 6c. PostGIS spatial indexes on boundary
  const r6c = await client.query(`
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'states' AND indexdef ILIKE '%gist%'
  `);
  results.push({ check: '6c. Spatial (GiST) index on states.boundary', status: r6c.rows.length > 0 ? 'PASS' : 'INFO', detail: r6c.rows.length > 0 ? r6c.rows[0].indexname : 'No GiST index found (optional for MVP)' });

  // Print report
  console.log('\n========================================');
  console.log('  RouteWise Phase 3 — Verification Report');
  console.log('========================================\n');
  let failCount = 0;
  for (const r of results) {
    const icon = r.status === 'PASS' ? 'PASS' : r.status === 'INFO' ? 'INFO' : 'FAIL';
    if (r.status === 'FAIL') failCount++;
    console.log(`[${icon}] ${r.check}`);
    console.log(`       ${r.detail}\n`);
  }
  console.log('========================================');
  console.log(`Total: ${results.length} checks | ${results.filter(r => r.status === 'PASS').length} PASS | ${failCount} FAIL | ${results.filter(r => r.status === 'INFO').length} INFO`);
  if (failCount > 0) console.log('\n*** ACTION REQUIRED: Fix FAIL items before proceeding. ***');
  else console.log('\n*** All critical checks passed. Ready for next phase. ***');
  console.log('========================================\n');

  await client.end();
}

verify().catch(e => { console.error('Verification error:', e); process.exit(1); });

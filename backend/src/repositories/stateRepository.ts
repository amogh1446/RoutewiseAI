// =============================================================
// RouteWise — State Repository (Data Access Layer)
// =============================================================
//
// All database access for the `states` table goes through here.
// Uses parameterized SQL via the raw pg driver. No ORM.
// =============================================================

import { query } from '../db/index.js';

/** Row shape returned from state queries (no PostGIS geometry column for listing) */
export interface StateRow {
  id: number;
  name: string;
  code: string;
  has_boundary: boolean;
  created_at: Date;
}

/** Row shape returned from single state lookup (includes boundary presence check) */
export interface StateDetailRow extends StateRow {
  constraints: Record<string, unknown> | null;
}

/**
 * Fetch all states, ordered alphabetically by name.
 * Excludes the raw boundary geometry to keep the response lightweight.
 * Returns a boolean `has_boundary` flag instead.
 */
export async function findAllStates(): Promise<StateRow[]> {
  const result = await query<StateRow>(
    `SELECT id, name, code, (boundary IS NOT NULL) AS has_boundary, created_at
     FROM states
     ORDER BY name`
  );
  return result.rows;
}

/**
 * Fetch a single state by its two-letter code (case-insensitive).
 * Returns null if not found.
 */
export async function findStateByCode(code: string): Promise<StateDetailRow | null> {
  const result = await query<StateDetailRow>(
    `SELECT id, name, code, (boundary IS NOT NULL) AS has_boundary, constraints, created_at
     FROM states
     WHERE UPPER(code) = UPPER($1)`,
    [code]
  );
  return result.rows[0] ?? null;
}

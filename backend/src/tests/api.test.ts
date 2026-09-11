// =============================================================
// RouteWise — API Integration Tests
// =============================================================
//
// Uses Node.js built-in test runner (node:test) — no extra deps.
// Tests the actual HTTP API against the real database.
// =============================================================

import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import '../env.js';
import { app } from '../app.js';
import { pool } from '../db/index.js';
import type { Server } from 'http';

let server: Server;
let baseUrl: string;

// Start the server on a random available port before tests
const startServer = (): Promise<void> =>
  new Promise((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`;
      }
      resolve();
    });
  });

// Helpers
async function get(path: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${baseUrl}${path}`);
  const body = await res.json() as Record<string, unknown>;
  return { status: res.status, body };
}

// ── Tests ─────────────────────────────────────────────────

describe('RouteWise API', async () => {
  await startServer();

  after(async () => {
    server.close();
    await pool.end();
  });

  // ── Health ────────────────────────────────────────────

  describe('GET /api/v1/health', () => {
    it('returns 200 with success: true', async () => {
      const { status, body } = await get('/api/v1/health');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as Record<string, unknown>;
      assert.equal(data.status, 'ok');
      assert.ok(data.timestamp);
    });
  });

  describe('GET /api/v1/health/db', () => {
    it('returns 200 with database status when DB is available', async () => {
      const { status, body } = await get('/api/v1/health/db');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as Record<string, unknown>;
      assert.equal(data.database, 'connected');
      assert.ok(data.postgis);
      assert.equal(data.states_loaded, 36);
    });
  });

  // ── States ────────────────────────────────────────────

  describe('GET /api/v1/states', () => {
    it('returns all 36 states with success envelope', async () => {
      const { status, body } = await get('/api/v1/states');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as Array<Record<string, unknown>>;
      assert.equal(data.length, 36);
      const meta = body.meta as Record<string, unknown>;
      assert.equal(meta.count, 36);
    });

    it('returns states sorted alphabetically by name', async () => {
      const { body } = await get('/api/v1/states');
      const data = body.data as Array<Record<string, unknown>>;
      const names = data.map((s) => s.name as string);
      const sorted = [...names].sort();
      assert.deepEqual(names, sorted);
    });

    it('includes has_boundary flag for MVP states', async () => {
      const { body } = await get('/api/v1/states');
      const data = body.data as Array<Record<string, unknown>>;
      const mvpCodes = ['KA', 'GA', 'MH', 'RJ', 'KL'];
      const mvpStates = data.filter((s) => mvpCodes.includes(s.code as string));
      assert.equal(mvpStates.length, 5);
      for (const s of mvpStates) {
        assert.equal(s.has_boundary, true, `${s.name} should have has_boundary=true`);
      }
    });
  });

  describe('GET /api/v1/states/:code', () => {
    it('returns Karnataka by code KA', async () => {
      const { status, body } = await get('/api/v1/states/KA');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as Record<string, unknown>;
      assert.equal(data.name, 'Karnataka');
      assert.equal(data.code, 'KA');
      assert.equal(data.has_boundary, true);
    });

    it('is case-insensitive (lowercase ka → Karnataka)', async () => {
      const { status, body } = await get('/api/v1/states/ka');
      assert.equal(status, 200);
      const data = body.data as Record<string, unknown>;
      assert.equal(data.name, 'Karnataka');
    });

    it('returns 404 for non-existent state code', async () => {
      const { status, body } = await get('/api/v1/states/ZZ');
      assert.equal(status, 404);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'STATE_NOT_FOUND');
    });

    it('returns 400 for invalid code format (numbers)', async () => {
      const { status, body } = await get('/api/v1/states/123');
      assert.equal(status, 400);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'INVALID_STATE_CODE');
    });

    it('returns 400 for code that is too long', async () => {
      const { status, body } = await get('/api/v1/states/ABCD');
      assert.equal(status, 400);
      assert.equal(body.success, false);
    });
  });

  // ── 404 Handling ──────────────────────────────────────

  describe('404 Handling', () => {
    it('returns 404 with consistent error format for unknown routes', async () => {
      const { status, body } = await get('/api/v1/nonexistent');
      assert.equal(status, 404);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'NOT_FOUND');
      assert.ok((error.message as string).includes('nonexistent'));
    });
  });
});

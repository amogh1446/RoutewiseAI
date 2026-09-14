import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ConstraintProvider, ConstraintCheckRequest, TripWarning } from './interfaces.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ConstraintRule {
  id: string;
  name: string;
  type: string;
  daysOfWeek?: number[];
  months?: number[];
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // [lon, lat] arrays
  };
  vehicleTypes?: string[];
  message: string;
  source: 'verified' | 'advisory';
  requiresVerification: boolean;
  severity: 'info' | 'warning' | 'critical';
}

interface ConstraintData {
  constraints: ConstraintRule[];
}

export class LocalConstraintProvider implements ConstraintProvider {
  private rules: ConstraintRule[] = [];

  constructor() {
    try {
      const dataPath = path.join(__dirname, '..', 'data', 'verified_constraints.json');
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      const parsed = JSON.parse(rawData) as ConstraintData;
      this.rules = parsed.constraints || [];
    } catch (err) {
      console.warn('Failed to load verified_constraints.json:', err);
    }
  }

  // Simple point-in-polygon logic for bounding box or simple polygon
  private isPointInPolygon(point: { lat: number; lng: number }, polygon: number[][][]): boolean {
    const x = point.lng;
    const y = point.lat;
    let inside = false;
    for (let j = 0; j < polygon.length; j++) {
      const ring = polygon[j];
      for (let i = 0, k = ring.length - 1; i < ring.length; k = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xk = ring[k][0], yk = ring[k][1];
        const intersect = ((yi > y) !== (yk > y)) && (x < (xk - xi) * (y - yi) / (yk - yi) + xi);
        if (intersect) inside = !inside;
      }
    }
    return inside;
  }

  evaluate(req: ConstraintCheckRequest): TripWarning[] {
    const warnings: TripWarning[] = [];
    const dayOfWeek = req.date.getDay(); // 0 (Sun) to 6 (Sat)
    const month = req.date.getMonth(); // 0 (Jan) to 11 (Dec)

    for (const rule of this.rules) {
      // 1. Vehicle check
      if (rule.vehicleTypes && !rule.vehicleTypes.includes(req.vehicle_type)) {
        continue;
      }

      // 2. Date/Day check
      if (rule.daysOfWeek && !rule.daysOfWeek.includes(dayOfWeek)) {
        continue;
      }
      if (rule.months && !rule.months.includes(month)) {
        continue;
      }

      // 3. Geographic check
      if (rule.geometry && rule.geometry.type === 'Polygon') {
        const inside = this.isPointInPolygon({ lat: req.lat, lng: req.lng }, rule.geometry.coordinates);
        if (!inside) {
          continue;
        }
      }

      // Rule matched! Add warning
      warnings.push({
        severity: rule.severity,
        title: rule.name,
        description: rule.message,
        source: rule.source,
        requiresVerification: rule.requiresVerification
      });
    }

    return warnings;
  }
}

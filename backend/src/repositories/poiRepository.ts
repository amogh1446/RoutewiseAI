import { pool } from '../db/index.js';
import type { PlaceResult } from '../providers/interfaces.js';

export async function upsertPois(pois: PlaceResult[], providerName: string): Promise<any[]> {
  if (pois.length === 0) return [];
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const savedPois = [];

    // Simple loop for MVP, but a batch insert is better in prod
    for (const poi of pois) {
      let poiRecord;
      
      const existingResult = await client.query(`
        SELECT * FROM pois WHERE source_id = $1 AND source_provider = $2
      `, [poi.place_id, providerName]);
      
      if (existingResult.rows.length > 0) {
        poiRecord = existingResult.rows[0];
      } else {
        const insertResult = await client.query(`
          INSERT INTO pois (name, source_id, source_provider, location, category)
          VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6)
          RETURNING id, name, category, source_id, source_provider;
        `, [poi.name, poi.place_id, providerName, poi.lng, poi.lat, poi.category]);
        poiRecord = insertResult.rows[0];
      }

      if (poiRecord) {
        // Upsert tags
        await client.query(`
          INSERT INTO poi_tags (poi_id, tag)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [poiRecord.id, poi.category]);

        savedPois.push({
          id: poiRecord.id,
          name: poiRecord.name,
          lat: poi.lat,
          lng: poi.lng,
          category: poiRecord.category,
          source_id: poiRecord.source_id,
          source_provider: poiRecord.source_provider
        });
      }
    }

    await client.query('COMMIT');
    return savedPois;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

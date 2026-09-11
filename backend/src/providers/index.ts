// =============================================================
// RouteWise — Geographic Providers Entry Point
// =============================================================

import { OSMProvider } from './osmProvider.js';

export * from './interfaces.js';
export { OSMProvider } from './osmProvider.js';

// Export a singleton instance of the default provider for the MVP.
// This allows easy replacement with another provider (e.g. Google Maps) later.
export const geoProvider = new OSMProvider();

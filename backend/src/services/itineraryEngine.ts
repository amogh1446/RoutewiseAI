import type { VehicleType } from '../utils/types.js';

export interface RouteInput {
  distanceKm: number;
  durationMinutes: number;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  geometry?: { coordinates: [number, number][] }; // GeoJSON LineString
}

export interface POIInput {
  id: string;
  place_id?: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
}

export interface TripParams {
  days: number;
  vehicle: VehicleType | string;
  pace: string;
  interests: string[];
  mustVisits?: any[];
  startName: string;
  endName: string;
}

export interface Stop {
  type: 'drive' | 'attraction' | 'food' | 'break' | 'arrival' | 'departure';
  time: string;
  name: string;
  detail: string;
  duration?: string;
  detour?: string;
  warning?: { severity: 'info' | 'advisory' | 'important'; text: string };
}

export interface ItineraryDay {
  day: number;
  from: string;
  to: string;
  km: number;
  driveTime: string;
  stops: Stop[];
  warnings: { severity: 'info' | 'advisory' | 'important'; title: string; description: string }[];
  highlights: string[];
}

export interface Feasibility {
  feasible: boolean;
  severity: 'none' | 'warning' | 'critical';
  reasons: string[];
  recommendedDays?: number;
}

export interface ItineraryResponse {
  feasibility: Feasibility;
  days: ItineraryDay[];
  warnings: { severity: 'info' | 'advisory' | 'important'; title: string; description: string }[];
}

// Haversine distance in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [time, period] = timeStr.split(' ');
  let [hours, mins] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  let totalMins = hours * 60 + mins + minutesToAdd;
  
  const newHours24 = Math.floor(totalMins / 60) % 24;
  const newMins = Math.floor(totalMins % 60);
  
  const outPeriod = newHours24 >= 12 ? 'PM' : 'AM';
  let outHours = newHours24 % 12;
  if (outHours === 0) outHours = 12;
  
  return `${outHours}:${newMins.toString().padStart(2, '0')} ${outPeriod}`;
}

// Project POI onto polyline to find distance along route and nearest point
function projectToPolyline(poi: { lat: number; lng: number }, coordinates: [number, number][]) {
  let minDistance = Infinity;
  let nearestPoint = coordinates[0];
  let distanceAlongRoute = 0;
  let cumulativeDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    const segmentLen = getDistanceKm(p1[1], p1[0], p2[1], p2[0]);
    
    // Very simplified projection: just find the closest node for now
    // A true point-to-segment projection is better, but this is sufficient for order tracking
    const distToNode = getDistanceKm(poi.lat, poi.lng, p1[1], p1[0]);
    if (distToNode < minDistance) {
      minDistance = distToNode;
      nearestPoint = p1;
      distanceAlongRoute = cumulativeDistance;
    }
    
    cumulativeDistance += segmentLen;
  }
  
  // Check last point
  const lastP = coordinates[coordinates.length - 1];
  const distToLast = getDistanceKm(poi.lat, poi.lng, lastP[1], lastP[0]);
  if (distToLast < minDistance) {
    minDistance = distToLast;
    nearestPoint = lastP;
    distanceAlongRoute = cumulativeDistance;
  }

  return { nearestLat: nearestPoint[1], nearestLng: nearestPoint[0], distanceAlongRoute, minDistance };
}

export async function generateItinerary(
  route: RouteInput,
  pois: POIInput[],
  params: TripParams,
  routeFinder: (start: {lat: number; lng: number}, end: {lat: number; lng: number}) => Promise<{ distance_meters: number; duration_seconds: number }>
): Promise<ItineraryResponse> {
  const { distanceKm, durationMinutes } = route;
  const { days, vehicle, pace, startName, endName, mustVisits = [] } = params;

  // 1. Feasibility Check
  const MAX_KM_PER_DAY = pace === 'fast' ? 550 : pace === 'relaxed' ? 300 : 450;
  const MAX_MINS_PER_DAY = pace === 'fast' ? 540 : pace === 'relaxed' ? 300 : 480;
  
  const requiredDaysByKm = Math.ceil(distanceKm / MAX_KM_PER_DAY);
  const requiredDaysByTime = Math.ceil(durationMinutes / MAX_MINS_PER_DAY);
  const minRequiredDays = Math.max(requiredDaysByKm, requiredDaysByTime, 1);

  const feasibility: Feasibility = {
    feasible: true,
    severity: 'none',
    reasons: []
  };

  if (days < minRequiredDays) {
    feasibility.feasible = false;
    feasibility.severity = 'critical';
    feasibility.reasons.push(`The journey requires at least ${minRequiredDays} days for safe driving limits. You selected ${days} days for a ${distanceKm.toFixed(0)} km trip.`);
    feasibility.recommendedDays = minRequiredDays;
  } else if (days === minRequiredDays && distanceKm > 300) {
    feasibility.severity = 'warning';
    feasibility.reasons.push(`Your trip is feasible but involves heavy driving (${formatDuration(durationMinutes / days)} per day).`);
  }

  if (!feasibility.feasible) {
    return {
      feasibility,
      days: [],
      warnings: feasibility.reasons.map(r => ({ severity: 'important', title: 'Unfeasible Trip', description: r }))
    };
  }

  let tripWarnings: any[] = [];
  let validPois = [];

  // 2. Detour Checks and Ordering
  // Only use route.geometry if available
  const coords = route.geometry?.coordinates || [[route.start.lng, route.start.lat], [route.end.lng, route.end.lat]];
  
  const DETOUR_MAX_KM = 20;
  const DETOUR_MAX_MINS = 45;

  for (const poi of pois) {
    const isMustVisit = mustVisits.some(m => m.id === poi.id || m.place_id === poi.id || m.name === poi.name);
    
    // Project to polyline
    const proj = projectToPolyline(poi, coords);
    
    // If straight line is already > 30km, definitely skip road routing to save time (unless it's a must-visit, but even then it's way off)
    if (proj.minDistance > 30 && !isMustVisit) continue;

    // Calculate actual detour cost using provider
    try {
      const detourLeg = await routeFinder({ lat: proj.nearestLat, lng: proj.nearestLng }, { lat: poi.lat, lng: poi.lng });
      const detourKm = detourLeg.distance_meters / 1000;
      const detourMins = detourLeg.duration_seconds / 60;
      const roundTripKm = detourKm * 2;
      const roundTripMins = detourMins * 2;

      if (roundTripKm <= DETOUR_MAX_KM && roundTripMins <= DETOUR_MAX_MINS) {
        validPois.push({ ...poi, score: proj.distanceAlongRoute, detourKm: roundTripKm, detourMins: roundTripMins, isMustVisit });
      } else {
        if (isMustVisit) {
          tripWarnings.push({ severity: 'important', title: 'Must-visit excluded', description: `${poi.name} was excluded because the detour is too large (${roundTripKm.toFixed(1)} km, ${Math.round(roundTripMins)} mins).` });
        }
      }
    } catch (err) {
      // If route finding fails, fallback to straight line
      if (proj.minDistance * 2 <= DETOUR_MAX_KM) {
         validPois.push({ ...poi, score: proj.distanceAlongRoute, detourKm: proj.minDistance * 2, detourMins: proj.minDistance * 2 * 2, isMustVisit });
      } else if (isMustVisit) {
         tripWarnings.push({ severity: 'important', title: 'Must-visit excluded', description: `${poi.name} was excluded because no road route could be found.` });
      }
    }
  }

  // Find must visits that were not in the POI list at all
  for (const mv of mustVisits) {
    if (!pois.some(p => p.id === mv.id || p.place_id === mv.id || p.name === mv.name)) {
      tripWarnings.push({ severity: 'advisory', title: 'Must-visit not found', description: `${mv.name || 'A requested place'} could not be found along this route corridor.` });
    }
  }

  // Sort by along-route distance
  validPois.sort((a, b) => a.score - b.score);

  // 3. Allocate Route and POIs into Days
  const dailyKm = distanceKm / days;
  const dailyMins = durationMinutes / days;
  
  let currentPoiIdx = 0;
  const itineraryDays: ItineraryDay[] = [];

  for (let day = 1; day <= days; day++) {
    const isLastDay = day === days;
    const isFirstDay = day === 1;
    
    const dayKm = Math.round(dailyKm);
    const dayMins = Math.round(dailyMins);
    
    // Dynamic POI density
    // Heavy driving > 300 mins (5 hrs) -> max 2
    // Moderate > 240 mins (4 hrs) -> max 3
    // Normal -> max 5
    let maxPois = 5;
    if (dayMins > 300) maxPois = 2;
    else if (dayMins > 240) maxPois = 3;

    // Distribute remaining POIs evenly if we have plenty of days
    const remainingDays = days - day + 1;
    const remainingPois = validPois.length - currentPoiIdx;
    let targetPoisPerDay = Math.ceil(remainingPois / remainingDays);
    if (targetPoisPerDay > maxPois) targetPoisPerDay = maxPois;
    
    const dayPois = [];
    while (currentPoiIdx < validPois.length && dayPois.length < targetPoisPerDay) {
      dayPois.push(validPois[currentPoiIdx]);
      currentPoiIdx++;
    }

    if (isLastDay && currentPoiIdx < validPois.length) {
      // Append must visits to last day if they got left behind, else drop them
      while (currentPoiIdx < validPois.length) {
        if (validPois[currentPoiIdx].isMustVisit && dayPois.length < maxPois + 1) {
          dayPois.push(validPois[currentPoiIdx]);
        }
        currentPoiIdx++;
      }
    }

    const stops: Stop[] = [];
    const highlights: string[] = [];
    let currentTime = isFirstDay ? '08:00 AM' : '09:00 AM';
    
    stops.push({
      type: 'departure',
      time: currentTime,
      name: isFirstDay ? `Depart ${startName}` : `Depart morning stay`,
      detail: `Beginning day ${day} of your journey.`
    });

    let cumulativeDriving = 0;
    const breakLimit = vehicle === 'motorcycle' ? 120 : 210; 
    
    for (const poi of dayPois) {
      const driveSegmentTime = Math.round(dayMins / (dayPois.length + 1));
      currentTime = addMinutesToTime(currentTime, driveSegmentTime);
      cumulativeDriving += driveSegmentTime;

      if (cumulativeDriving > breakLimit) {
        stops.push({
          type: 'break',
          time: currentTime,
          name: 'Recommended Rest Stop',
          detail: vehicle === 'motorcycle' ? 'Take a break from riding to stretch and hydrate.' : 'Take a short driving break.',
          duration: '15m'
        });
        currentTime = addMinutesToTime(currentTime, 15);
        cumulativeDriving = 0;
      }

      const isFood = poi.category.includes('food');
      stops.push({
        type: isFood ? 'food' : 'attraction',
        time: currentTime,
        name: poi.name + (poi.isMustVisit ? ' (Must Visit)' : ''),
        detail: `Enjoy stopping at this ${poi.category}.`,
        duration: isFood ? '45m' : '1h',
        detour: poi.detourKm > 1 ? `${(poi.detourKm/2).toFixed(1)} km detour` : undefined
      });
      highlights.push(poi.name);
      currentTime = addMinutesToTime(currentTime, isFood ? 45 : 60);
    }

    const finalDriveMins = Math.round(dayMins / (dayPois.length + 1));
    currentTime = addMinutesToTime(currentTime, finalDriveMins);

    stops.push({
      type: 'arrival',
      time: currentTime,
      name: isLastDay ? `Arrive in ${endName}` : `Check in, Day ${day} Base`,
      detail: isLastDay ? 'End of the journey.' : 'Rest and recharge for tomorrow.'
    });

    itineraryDays.push({
      day,
      from: isFirstDay ? startName : `Day ${day - 1} Stop`,
      to: isLastDay ? endName : `Day ${day} Stop`,
      km: dayKm,
      driveTime: formatDuration(dayMins),
      stops,
      warnings: dayMins > 360 ? [{ severity: 'important', title: 'Long driving day', description: 'Take breaks regularly and stay hydrated.' }] : [],
      highlights: highlights.slice(0, 3)
    });
  }

  if (validPois.length === 0 && tripWarnings.length === 0) {
    tripWarnings.push({ severity: 'info', title: 'No suitable POIs', description: 'No suitable places of interest were found within reasonable detour range.' });
  }

  return {
    feasibility,
    days: itineraryDays,
    warnings: tripWarnings
  };
}

# RouteWise — Project Rules & Architecture Guardrails

## 1. Product Scope

**RouteWise** is an India-only, AI-assisted self-drive road-trip planning platform designed specifically for self-drive travelers.

- **Geographic Coverage**: Strictly limited to India.
- **Supported Vehicles**:
  - Cars (hatchbacks, sedans, SUVs, EVs, 4x4s)
  - Motorcycles / Bikes (cruisers, adventure tourers, commuters)
- **Primary Value Proposition**: Reliable, executable, and realistic road-trip itineraries combining verified geographic routing with personalized, context-aware travel narratives.

---

## 2. Supported Trip Types

RouteWise Version 1 supports the following trip patterns:

1. **One-Day Trips**: Single-day excursions, day-outs, and weekend quick rides/drives originating and returning on the same calendar day.
2. **Multi-Day Trips**: Extended journeys spanning multiple consecutive days with planned overnight halts.
3. **Point-to-Point Trips**: Journeys starting at Point A and terminating at Point B without returning to the origin.
4. **Round Trips**: Closed-loop journeys starting and ending at the same origin location.
5. **Explore-from-Base Trips**: Hub-and-spoke trips where travelers establish a base camp / central stay and undertake day excursions into surrounding areas.

---

## 3. Core Boundaries

To maintain software reliability, execution safety, and development velocity, the following boundaries define RouteWise:

- **Strictly Self-Drive**: Focuses exclusively on user-driven cars and rider-operated motorcycles.
- **Domestic India Constraints**: All routing logic, highway categorizations, permit awareness, and timing heuristics must be tailored to Indian driving conditions (terrain, ghat sections, state borders, seasonal variations).
- **Advisory & Planning Only**: RouteWise is a pre-trip and in-trip itinerary planning platform, not an in-cab telemetry device or live turn-by-turn navigator.

---

## 4. AI Hallucination Guardrails

Large Language Models (LLMs) are strictly prohibited from generating factual geographic or operational data. Hallucination guardrails must be enforced at the architecture and prompt-engineering layers.

### The LLM Must NEVER Invent:
- **Place Existence**: Generating fictitious destinations, attractions, hotels, fuel stops, or viewpoints.
- **Coordinates**: Latitude and longitude numbers generated from LLM parametric memory.
- **Routes & Geometry**: Generating waypoints, polylines, or road directions.
- **Distances**: Mileage or kilometer values between points.
- **Driving Times / Durations**: Estimates of driving or transit duration.
- **Opening Hours / Timings**: Operational hours of monuments, parks, temples, or attractions.
- **Permits & Documentation**: Entry permit requirements, Inner Line Permits (ILP), or forest department passes.
- **Road Restrictions**: Vehicle restrictions, axle limits, toll policies, one-way ghat roads, or seasonal road closures.
- **Weather Conditions**: Current weather, historical forecasts, or live hazard alerts.

### The LLM May ONLY:
- **Interpret User Preferences**: Parse vibes, travel styles, preferred pacing, culinary interests, scenic preferences, and travel party compositions.
- **Extract Structured Intent**: Convert free-form user prompts into machine-readable filters, constraints, and parameters.
- **Explain Verified Recommendations**: Provide engaging, educational, and contextual descriptions of places already selected by the deterministic engine.
- **Generate Natural-Language Summaries**: Synthesize itineraries, generate packing lists, highlight historical or cultural trivia, and craft readable day-by-day travel narratives.

---

## 5. Out-of-Scope Features (Version 1)

The following capabilities are explicitly **excluded** from Version 1 development:

- **Public Transport**: Buses, trains (IRCTC), metros, ferries, or shared taxis.
- **Flights**: Airline searches, airfare comparisons, or flight ticketing.
- **Hotel Booking**: Direct booking engines, room availability checks, or payment gateways for accommodation.
- **Parking Intelligence**: Live parking space availability, lot pricing, or valet tracking.
- **Live GPS Tracking**: Real-time user location broadcasting, telemetry tracking, or breadcrumb mapping.
- **Turn-by-Turn Navigation**: Voice-guided live driving directions, recalculations during driving, or offline navigation.
- **Emergency Warning System**: Live SOS networks, real-time accident detection, or automated roadside assistance dispatch.
- **Exact Trip Cost Prediction**: Guaranteeing exact fuel expenses, toll tolls, or meal costs (only broad, non-binding estimates or ranges may be modeled).
- **Custom Map Engine**: Building proprietary base maps, tilesets, or vector renderers from scratch.
- **Traffic Prediction Models**: Developing in-house machine-learning algorithms to predict future traffic patterns.

---

## 6. Development Principles

All system components must adhere to the foundational pipeline:

```mermaid
flowchart LR
    A[Verified Geographic Data] --> B[Deterministic Constraint Engine]
    B --> C[Itinerary Optimizer]
    C --> D[AI Personalization & Explanation]
```

1. **Pipeline Ordering**:
   - **Step 1: Verified Geographic Data**: Ingestion from ground-truth sources.
   - **Step 2: Deterministic Constraint Engine**: Evaluation of physical road rules, vehicle-specific constraints (car vs. motorcycle), driving limits (max hours per day, daylight rules).
   - **Step 3: Itinerary Optimizer**: Graph-based and combinatorial optimization for stops, halts, and sequencing.
   - **Step 4: AI Personalization / Explanation**: LLM consumes the computed, verified output and personalizes the presentation for the user.
2. **Deterministic Precedence**: Math and verified database rules always take precedence over LLM output. If an LLM response contradicts verified routing data, the LLM output is rejected.
3. **Fail-Closed Safety**: When route safety, road access, or permits cannot be verified against credible data, the system must warn the traveler and refrain from presenting speculative paths.
4. **No Application Code Prematurely**: Foundation, data models, and architectural definitions must be established before producing feature code.

---

## 7. Geographic Data Truth & Verification Rule

- **Single Source of Truth**: All factual geographic data (place names, coordinates, distances, travel durations, elevation profiles, and POI metadata) **must originate strictly from verified external APIs or curated, validated databases** (e.g., Google Maps Platform / Mapbox / OpenStreetMap / verified government portals).
- **Zero Raw LLM Ingestion for Geodata**: At no point shall raw LLM text outputs be parsed to insert coordinates, road links, or physical place entries directly into the production database.
- **Verification Gate**: Every point of interest (POI) and routing node included in an itinerary must possess a verified database key or valid API identifier (such as a Place ID or verified geospatial coordinate pair).

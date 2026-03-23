# IoT Plant Component Structure Analysis

## Executive Summary

The codebase uses a **dual-layer component definition system**:
1. **Visual Layer**: Hotspots defined in `hotspots.config.json` for UI visualization and interaction
2. **Data Layer**: PlantComponent entities defined in TypeScript types with mock data for state management

Components are **NOT directly persisted in the database**. Instead, sensor data is ingested via MQTT and stored separately, with a lightweight schema containing only `componentId`, `topic`, `payload`, and `timestamp`.

---

## 1. Component Definition Layers

### 1.1 Frontend Visual Layer: `hotspots.config.json`
[Located at: `frontend/src/entryRoute/hotspots.config.json`]

**Purpose**: Defines visual positions, icons, and UI interactions for components on the plant map.

**Structure** (HotspotConfig interface):
```typescript
{
  id: string;                    // Unique hotspot ID
  name: string;                  // Display name
  iconId: HotspotIconId;         // Icon type reference
  x: number;                     // Screen X coordinate
  y: number;                     // Screen Y coordinate
  iconSize?: number;             // Icon size in pixels
  rotation?: number;             // Icon rotation in degrees
  layer?: number;                // Z-layer for rendering
  direction?: HotspotDirection;  // "left" or "right" (for conveyors)
  initialState: HotspotState;    // "on" | "off" | "error"
  stateSource: HotspotStateSource;  // How state is determined
  action: HotspotAction;         // What happens when clicked
  ariaLabel?: string;            // Accessibility label
}
```

**stateSource Types**:
- `{ type: "values" }` - State from backend/API (currently unused)
- `{ type: "local" }` - State managed locally (default)

**action Types**:
- `{ type: "openDetails"; target: string }` - Opens component details panel
- `{ type: "toggleState" }` - Toggles component state (rarely used)
- `{ type: "navigate"; path: string }` - Navigates to different page

### 1.2 Data Layer: PlantComponent TypeScript Type
[Located at: `frontend/src/types/PlantComponent.ts`]

**Purpose**: Defines the runtime component data structure for state management and API communication.

```typescript
interface PlantComponent {
  id: string;                    // Component ID (e.g., "ind-sensor-1")
  name: string;                  // Human-readable name
  role: "sensor" | "actuator";   // Functional role
  category: Category;            // Component type (see categories below)
  status: "on" | "off";          // Current status
  online: boolean;               // Connection status
  lastChanged: string;           // ISO timestamp
  stats: {
    cycles?: number;             // Operation count
    uptimeHours?: number;        // Operating time
    lastValue?: number | boolean; // Last measured value
  };
  mqttTopics: {
    status: string;              // Topic for status updates
    command?: string;            // Topic for sending commands
    telemetry?: string;          // Topic for detailed telemetry
  };
}
```

### 1.3 Mock Data Source
[Located at: `frontend/src/types/mockData.ts`]

**Purpose**: Provides hardcoded PlantComponent array for testing/demo without backend API.

Components are built dynamically using a `buildComponents()` factory function with parameters like count, namePrefix, idPrefix, status distribution, etc.

---

## 2. Component Categories & Types

**Defined in**: `frontend/src/types/PlantComponent.ts` (Category type)

```typescript
type Category =
  | "conveyor"           // Standard conveyors (14 units)
  | "rotating-conveyor"  // Rotating/turntable systems (3 units)
  | "press"              // Pressing/forming units (3 units)
  | "inductive-sensor"   // Metal detection sensors (19 units)
  | "rfid-sensor"        // Radio frequency ID readers (5 units)
  | "optical-sensor"     // Photoelectric/light barriers (1 unit)
  | "pneumatic-unit"     // Ball loaders/pneumatic actuators (6 units)
  | "crane"              // Not yet implemented in hotspots
  | "storage"            // High-bay storage system (1 unit)
  | "input"              // Input station/entry point (1 unit)
```

### Component Count Summary (from hotspots.config.json):
| Category | Count | Icon ID |
|----------|-------|---------|
| conveyor | 14 | conveyor-belt |
| rotating-conveyor | 3 | rotating-conveyor |
| ball-loader (pneumatic) | 6 | ball-loader |
| inductive-sensor | 18 | inductive-sensor |
| rfid-sensor | 5 | rfid-sensor |
| lightbarrier-sensor | 1 | lightbarrier-sensor |
| input-station | 1 | input-station |
| highbay-storage | 1 | highbay-storage |
| **TOTAL** | **49** | |

---

## 3. Component ID Naming Convention

### 3.1 Hotspot IDs (UI layer)
**Format**: `<component-type>-<number>` or `<component-type>-<number>-details`

**Examples**:
- Conveyors: `conveyor-1`, `conveyor-2`, ... `conveyor-14`
- Rotating conveyors: `rotating-conveyor-1`, `rotating-conveyor-2`, `rotating-conveyor-3`
- Inductive sensors: `inductive-0`, `inductive-1`, ... `inductive-17` (starts at 0!)
- RFID sensors: `rfid-1`, `rfid-2`, ... `rfid-5`
- Ball loaders: `ball-loader-1`, ... `ball-loader-6`
- Light barrier: `lightbarrier-1`
- Input station: `input-station-1`
- High-bay storage: `highbay-storage-1`

**Details suffix**: Actions often reference `<hotspot-id>-details` for detail panels.

### 3.2 Component IDs (Data layer - mocK data)
**Format**: `<category-prefix>-<number>`

**Mapping** (from `frontend/src/entryRoute/componentBindings.ts`):

| Hotspot Pattern | Component ID Pattern | Example |
|---|---|---|
| `conveyor-N` | `conveyor-N` (direct) | `conveyor-1` |
| `rotating-conveyor-N` | `rotating-N` | `rotating-1` |
| `ball-loader-N` | `pneumatic-N` | `pneumatic-1` |
| `inductive-N` | `ind-sensor-N` | `ind-sensor-1` |
| `rfid-N` | `rfid-N` (direct) | `rfid-1` |
| `lightbarrier-N` | `optical-N` | `optical-1` |
| `input-station-N` | `input-N` | `input-1` |
| `highbay-storage-N` | `storage-N` | `storage-1` |

**INCONSISTENCY ALERT** ⚠️:
- **Inductive sensors in hotspots start at 0** (`inductive-0`), but mock data prefixes them as `ind-sensor-1`
- The conversion mapping in `componentBindings.ts` attempts to normalize this via `normalizeToComponentId()`
- This creates potential confusion: is it a 0-indexed or 1-indexed system?

### 3.3 MQTT Topic Structure
**Subscribed patterns** (from `backend/src/mqtt/mqtt.service.ts`):
```
entry-route/#        // Entry route components
hochregallager/#     // High-bay storage module
plant/#              // Generic plant topics
```

**Topic-to-ComponentId Derivation**:
- The backend takes the first segment of the topic as `componentId`
- Example: `entry-route/status` → `componentId = "entry-route"`
- This is **inconsistent** with the frontend component ID naming!

**Data Storage** (Prisma schema):
```prisma
model SensorData {
  componentId String   // Derived from MQTT topic's first segment
  topic       String   // Full MQTT topic (e.g., "entry-route/status")
  payload     Json     // Raw JSON payload
  receivedAt  DateTime // Ingestion timestamp
}
```

---

## 4. How Hotspots Map to Components

### 4.1 Component Binding System
[Located at: `frontend/src/entryRoute/componentBindings.ts`]

**Purpose**: Translates UI hotspot IDs to data layer component IDs.

**Key Functions**:
1. `resolveComponentId(hotspotId)` - Converts hotspot ID → component ID
   - Uses a `HOTSPOT_TO_COMPONENT` lookup map
   - Falls back to regex pattern matching if not in map
   
2. `getTopDownComponentIds()` - Returns all component IDs used in hotspots
   - Parses both direct hotspot IDs and action targets

3. `getHotspotIdsForComponent(componentId)` - Reverse lookup

**Conversion Logic**:
```typescript
const HOTSPOT_TO_COMPONENT: Record<string, string> = {
  "input-station-1": "input-1",
  "rotating-conveyor-1": "rotating-1",
  "inductive-0": "ind-sensor-1",  // Starts at 0, maps to 1!
  "inductive-1": "ind-sensor-1",  // Inconsistent!
  // ... more mappings
};

// Then pattern matching for dynamic IDs:
const inductiveMatch = withoutDetails.match(/^inductive-(\d+)$/);
if (inductiveMatch) {
  return `ind-sensor-${inductiveMatch[1]}`;  // Strips "-details" suffix
}
```

### 4.2 Hotspot Rendering Pipeline
1. `hotspots.config.json` → `mapHotspots.ts` → `MAP_HOTSPOTS` array
2. Component renders hotspots on canvas using iconId
3. On click, action dispatched → hotspot ID converted to component ID
4. Component details panel opens with matching component from `mockComponents`

---

## 5. Component Details & Information Loading

### 5.1 Component Details Sources (Current)
**All hardcoded — NO API calls**:

1. **Mock Data** (`frontend/src/types/mockData.ts`)
   - Used by: ComponentBrowserPage, PlantOverviewPage
   - Provides: ID, name, role, category, status, online, stats

2. **Icon Components** (`frontend/src/entryRoute/icons/`)
   - InductiveSensorIcon.tsx, RfidSensorIcon.tsx, ConveyorBeltIcon.tsx, etc.
   - Renders visual representation based on active/inactive state

3. **Documentation Hardcoded** (`frontend/src/pages/DocumentationPage.tsx`)
   - Provides troubleshooting guides per sensor type
   - Component specifications (purpose, signals, etc.)

4. **i18n Translations** (`frontend/src/i18n.ts`)
   - Group labels: `"group.inductive-sensor"`, `"group.rfid-sensor"`, etc.
   - Descriptions for troubleshooting commands

### 5.2 Backend API Endpoints (Available)
[Located at: `backend/src/sensor-data/sensor-data.controller.ts`]

**API Base Path**: `/api/sensor-data`

| Endpoint | Purpose |
|----------|---------|
| `GET /api/sensor-data` | List all sensor readings (queryable by componentId, topic) |
| `GET /api/sensor-data/latest` | Most recent reading per componentId |
| `GET /api/sensor-data/:componentId` | Readings for specific component |
| `GET /api/sensor-data/stats/:componentId` | Stats: count, first/last timestamp |
| `GET /api/sensor-data/activity/:componentId` | Activity binned by minute or hour |
| `GET /api/sensor-data/range?from=X&to=Y` | Readings in timestamp range |

**Query Parameters**:
- `componentId` - Filter by component (stored from MQTT topic)
- `topic` - Filter by MQTT topic
- `limit` - Results per page (default 50, max 500)
- `offset` - Pagination offset
- `since` - Timestamp filter
- `interval` - Activity granularity (minute/hour)

**⚠️ LIMITATION**: Backend has no endpoint to GET component metadata (definitions). Only sensor data is available.

### 5.3 Where Component Definitions Are Missing
The codebase **lacks**:
- No component registry/database table
- No API endpoint to GET all components with metadata
- No component creation/update endpoints
- Component definitions hardcoded in frontend mockData only

---

## 6. Data Flow Diagrams

### Component Display Flow:
```
hotspots.config.json
    ↓
mapHotspots.ts (validation + defaults)
    ↓
iconId → ComponentCategoryIcon lookup
    ↓
Icon rendered on canvas
    ↓
On click: hotspotId → resolveComponentId()
    ↓
componentId looked up in mockComponents
    ↓
ComponentDetails panel displays stats
```

### MQTT Ingestion Flow:
```
MQTT Broker (entry-route/#, hochregallager/#, plant/#)
    ↓
MqttService receives message
    ↓
Topic split: "entry-route/status" → componentId = "entry-route"
    ↓
Payload parsed & validated
    ↓
SensorData record created in PostgreSQL:
  {
    componentId: "entry-route",
    topic: "entry-route/status",
    payload: { ... },
    receivedAt: now()
  }
    ↓
Data queryable via /api/sensor-data endpoints
```

---

## 7. Identified Inconsistencies & Issues

### 7.1 ID Numbering Inconsistency
| Issue | Location | Impact |
|-------|----------|--------|
| Inductive sensors in hotspots start at **0** | hotspots.config.json | Confusing: inductive-0 vs ind-sensor-1 mapping |
| Other components start at **1** | hotspots.config.json | Consistent for conveyors, sensors, etc. |
| **Root cause**: Likely historical - sensor IDs may have been 0-indexed in original system | componentBindings.ts mapping | Manual hardcoded lookup entries |

### 7.2 MQTT ComponentId Derivation
| Issue | Description | Priority |
|-------|-------------|----------|
| Only **first topic segment** used | "entry-route/status" → componentId="entry-route" | High |
| Doesn't match frontend component IDs | Frontend expects "conveyor-1", backend stores "entry-route" | High |
| No componentId table/registry | Can't map MQTT componentId to PlantComponent | Medium |
| Each topic module uses own prefix | "entry-route/", "hochregallager/" - no unified scheme | Medium |

### 7.3 Missing Component Registry
| Gap | Consequence |
|-----|------------|
| No database table for component definitions | Can't update component metadata |
| Component count/names hardcoded in frontend | Changes require code deployment |
| No API to get components | Frontend can't dynamically load component list |
| Mock data separate from real data | Development/test data not validated against actual schema |

### 7.4 Statemanagement Mismatch
| Layer | Source | Status |
|-------|--------|--------|
| Hotspot state (on/off) | hotspots.config.json (initialState) | Hardcoded, never updates |
| Component state (on/off) | mockComponents in frontend | In-memory, no persistence |
| MQTT sensor data | Backend SensorData table | Only raw readings stored |
| Component status in API | **Not available** | No endpoint returns component.status |

---

## 8. Summary Table: Component Reference System

| Aspect | Definition | Location | Status |
|--------|-----------|----------|--------|
| **Visual UI Layer** | Hotspots with positions, icons, interactions | hotspots.config.json | ✅ Complete |
| **Data Structure** | PlantComponent interface | PlantComponent.ts | ✅ Defined |
| **Mock Data** | 49 hardcoded components | mockData.ts | ✅ Available |
| **Component Registry** | Database table of components | ❌ Missing | Not yet implemented |
| **Component Metadata API** | Endpoint to GET components | ❌ Missing | No endpoint |
| **Sensor Data API** | Endpoint for readings | ✅ /api/sensor-data | Available |
| **Icon Components** | SVG renderers for each type | icons/ folder | ✅ Complete |
| **Hotspot→Component Mapping** | ID conversion logic | componentBindings.ts | ⚠️ Fragile (0/1 index issue) |
| **Internationalization** | Translated labels & descriptions | i18n.ts | ✅ Complete |

---

## 9. Recommendations

### Immediate Issues to Fix:
1. **Unify inductive sensor indexing** - Decide 0-based or 1-based, update both hotspots.config.json and mockData.ts
2. **Document component ID mappings** - Create mapping table in componentBindings.ts with comments explaining inconsistencies
3. **Add componentId validation** - When MQTT messages arrive, validate componentId against known values

### Medium-term Improvements:
1. **Create Component registry API**:
   - `GET /api/components` - List all components
   - `GET /api/components/:id` - Get component metadata
   - Let frontend dynamically load definitions instead of hardcoding

2. **Unify MQTT topic structure**:
   - Use hierarchical IDs: `entry-route/conveyor-1/status` instead of just `entry-route/status`
   - Derive proper componentId from topic pathComponents

3. **Persist component metadata**:
   - Add Prisma `Component` model with fields: id, name, category, role, etc.
   - Update hotspots.config.json generation from database
   - Remove mock data hardcoding

### Long-term Architecture:
1. **Single source of truth**: Database-driven component registry
2. **Dynamic UI**: Frontend loads hotspots.config.json from API (or generates from component data)
3. **Type safety**: Codegen TypeScript interfaces from Prisma models
4. **Mobile parity**: Remove hardcoded hotspot coordinates, make layout data-driven

---

## Appendix: File Reference Map

```
Backend:
  ├── backend/src/
  │   ├── mqtt/mqtt.service.ts           (MQTT subscription, topic parsing)
  │   ├── sensor-data/sensor-data.controller.ts  (API endpoints)
  │   └── prisma/schema.prisma           (SensorData model)
  └── prisma/schema.prisma               (Database schema)

Frontend:
  ├── frontend/src/
  │   ├── entryRoute/
  │   │   ├── hotspots.config.json       (Visual hotspot definitions)
  │   │   ├── mapHotspots.ts             (Type definitions & validation)
  │   │   ├── componentBindings.ts       (ID mapping logic)
  │   │   └── icons/                     (Icon components)
  │   ├── types/
  │   │   ├── PlantComponent.ts          (Data structure)
  │   │   └── mockData.ts                (Hardcoded component list)
  │   ├── pages/
  │   │   ├── ComponentBrowserPage.tsx   (Component browsing UI)
  │   │   ├── DocumentationPage.tsx      (Component documentation & specs)
  │   │   └── PlantOverviewPage.tsx      (Main plant overview)
  │   ├── components/
  │   │   ├── ComponentDetails.tsx       (Detail panel)
  │   │   ├── ComponentGroupList.tsx     (Component list by category)
  │   │   └── ComponentCategoryIcon.tsx  (Category→Icon renderer)
  │   └── i18n.ts                        (Translations & labels)

Documentation:
  └── website-workspace/docs/
      └── integration/entry-route.md     (Component descriptions)
```


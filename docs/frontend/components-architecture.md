# Frontend Component Architecture

## Directory Structure

```
frontend/src/
├── components/
│   ├── common/              # Shared, reusable UI building blocks
│   │   ├── PageHeader.tsx   # Consistent page header typography
│   │   └── StatusChips.tsx  # StatusChip and OnlineChip components
│   ├── layout/              # Application layout shell
│   │   └── MainLayout.tsx   # App bar, sidebar navigation, content outlet
│   └── domain/              # Domain-specific (plant) components
│       ├── ComponentDetails.tsx      # Detail card for a single plant component
│       ├── ComponentGroupList.tsx    # Accordion list grouped by category
│       └── ComponentTileGrid.tsx     # Card grid of plant components
├── pages/                   # Route-level page components
│   ├── PlantOverviewPage.tsx     # Interactive SVG map with hotspots
│   ├── ComponentBrowserPage.tsx  # List/grid browser with detail drawer
│   └── MqttSettingsPage.tsx      # MQTT broker configuration form
├── services/                # External service integrations
│   └── mqttClient.ts        # MQTT connection, subscribe, message handling
├── types/                   # TypeScript type definitions and mock data
│   ├── PlantComponent.ts    # PlantComponent, Role, Category types
│   ├── MqttSettings.ts      # MqttSettings, ConnectionStatus types
│   └── mockData.ts          # Mock plant component data for development
└── utils/                   # Utility functions
    ├── hotspot.ts            # Hotspot coordinate helpers and sanitization
    ├── hotspot.test.ts       # Vitest tests for hotspot utilities
    └── categoryLabel.ts      # Category string formatting utility
```

## Component Categories

### `components/common/`

Shared, reusable UI primitives that have no domain knowledge:

- **`PageHeader`** – Wraps MUI `Typography` with a consistent `h4` / bold-700 style for page titles.
- **`StatusChip`** – Renders an on/off status chip with appropriate colors.
- **`OnlineChip`** – Renders an online/offline chip with appropriate colors.

### `components/layout/`

Application-level layout components:

- **`MainLayout`** – Provides the app bar, responsive sidebar navigation, and content outlet (`<Outlet />`). Uses MUI's `Drawer` with permanent/temporary variants based on screen size.

### `components/domain/`

Domain-specific components tied to the plant monitoring feature:

- **`ComponentDetails`** – Shows detailed information about a selected plant component (status, MQTT topics, stats).
- **`ComponentGroupList`** – Accordion-based list of plant components grouped by category.
- **`ComponentTileGrid`** – Card grid layout showing all plant components with quick status indicators.

## Pages

Each page is a route-level component rendered inside `MainLayout`:

| Route          | Component               | Description                                         |
| -------------- | ----------------------- | --------------------------------------------------- |
| `/plant`       | `PlantOverviewPage`     | Interactive top-down SVG with clickable hotspots     |
| `/components`  | `ComponentBrowserPage`  | Filterable list/grid with detail drawer              |
| `/mqtt`        | `MqttSettingsPage`      | MQTT broker configuration form                      |
| `*`            | Redirect → `/plant`     | Default route                                        |

## Routing

Routing is handled by `react-router-dom` v7 in `App.tsx`. All routes are nested under `MainLayout` which provides the sidebar and app bar.

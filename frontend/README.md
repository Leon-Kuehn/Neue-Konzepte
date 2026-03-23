# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## AI Assistant (Free API Option)

The project includes an in-app AI assistant tab with slash commands such as `/help`, `/sensor`, `/component`, `/mqtt`, `/lager`, and `/analyse`.

By default, it works with local project knowledge rules (no external API required).

If you want optional lightweight model responses via HuggingFace free tier, create a `.env.local` in `frontend/`:

```bash
VITE_HF_API_TOKEN=your_huggingface_token
VITE_HF_MODEL=Qwen/Qwen2.5-1.5B-Instruct
# optional override:
# VITE_HF_API_URL=https://router.huggingface.co/v1/chat/completions
```

Notes:
- Keep in mind that `VITE_*` variables are exposed to the browser runtime.
- For production or sensitive environments, proxy the API through a backend service.

## Sensor Data Integration

This frontend uses two data paths at the same time:

- REST (`/api/*`) for persisted sensor data, health checks, and historical/statistical queries.
- MQTT for live machine state updates in near real time.

### Frontend -> Backend (REST)

The typed REST client is implemented in `src/services/sensorDataApi.ts`.

Responsibilities:

- Define typed request/response contracts for sensor-data endpoints.
- Build URLs with consistent base path handling (`/api` by default).
- Encode query params safely.
- Throw on non-2xx responses.

Supported backend endpoints include:

- `GET /api/health`
- `GET /api/sensor-data`
- `GET /api/sensor-data/latest`
- `GET /api/sensor-data/:componentId`
- `GET /api/sensor-data/range`
- `GET /api/sensor-data/stats/:componentId`
- `GET /api/sensor-data/activity/:componentId`

### React Query Hooks

Reusable hooks are implemented in `src/hooks/useSensorData.ts`.

- `useHealth(options?)`
  - Checks backend availability.
  - Used by the backend status chip in the layout.
- `useAllSensorData(params?, options?)`
  - Fetches filtered sensor rows.
- `useLatestSensorData(options?)`
  - Fetches latest persisted row per component.
  - Useful for overview cards and initial DB-backed context.
- `useComponentHistory(componentId, historyOptions?, options?)`
  - Fetches recent rows for one component.
  - Query is disabled automatically when `componentId` is empty.
- `useComponentStats(componentId, options?)`
  - Fetches aggregate stats (count/min/max/average/timestamps).
  - Query is disabled automatically when `componentId` is empty.
- `useComponentActivity(componentId, interval?, options?)`
  - Fetches activity buckets (`minute`/`hour`) for one component.

Typical usage pattern:

1. Use a broad query (`useLatestSensorData`) for overview context.
2. When the user selects a component, run component-scoped queries (`useComponentHistory`, `useComponentStats`, optionally `useComponentActivity`).
3. Pass query loading/error/data state into detail panels.

### MQTT Live vs REST Historical (Separation of Concerns)

- MQTT path:
  - Handles real-time operational status updates.
  - Updates live component state shown in map/tiles.
- REST path:
  - Handles persisted data from backend/database.
  - Provides latest stored payload, history, and statistics.

Current UI integration points:

- `src/pages/PlantOverviewPage.tsx`
  - Merges live MQTT component state with REST query results for selected component details.
- `src/components/ComponentDetails.tsx`
  - Shows backend latest stored value, stats, history, plus explicit no-data messages.
- `src/components/BackendStatus.tsx`
  - Uses `useHealth` to display `Backend: OK` or `Backend: Unreachable`.

### For AI Agents

When changing sensor-data integration, follow these rules:

- Keep MQTT logic and REST logic separate. Do not replace live MQTT updates with polling.
- Prefer editing `sensorDataApi.ts` and `useSensorData.ts` first, then adapt UI consumers.
- Preserve typed contracts and query-key stability in React Query hooks.
- Keep `/api` relative by default so Docker/Nginx proxy works.
- Add or update tests for new hook usage and UI loading/error/no-data states.

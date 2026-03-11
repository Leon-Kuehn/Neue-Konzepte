# Frontend Styling Guide

## Technology

- **MUI (Material UI) v7** — Primary component library and design system.
- **Emotion** (`@emotion/react`, `@emotion/styled`) — CSS-in-JS engine used by MUI.
- **Global CSS** — Minimal reset and keyframe animations in `src/index.css`.

## Theme

The application uses a custom MUI theme defined in `App.tsx`:

```tsx
const theme = createTheme({
  palette: {
    primary: { main: "#E30613" },        // Corporate red accent
    background: { default: "#f5f5f5" },  // Light grey background
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

### Brand Color

The primary accent color is **#E30613** (red), used for:
- App bar background
- Selected navigation items
- Hotspot highlights
- Primary buttons
- Selected component borders

## Styling Approach

### MUI `sx` Prop (Preferred)

All component-level styling uses MUI's `sx` prop for inline styles that are theme-aware:

```tsx
<Box sx={{ display: "flex", gap: 2, p: 3 }}>
```

### No CSS Modules or Styled Components

The project does **not** use CSS modules or standalone styled-components. All styling is co-located with components via the `sx` prop.

### Global CSS (`src/index.css`)

Contains only:
- CSS reset (`* { margin: 0; padding: 0; box-sizing: border-box; }`)
- Font-family base
- `@keyframes pulseHalo` animation for active hotspots

## Common Patterns

### Responsive Design

MUI breakpoints are used via the `sx` prop:

```tsx
<Stack direction={{ xs: "column", md: "row" }}>
```

Media queries via `useMediaQuery`:

```tsx
const isMobile = useMediaQuery(theme.breakpoints.down("md"));
```

### Status Colors

| Status     | Color     | Usage                        |
| ---------- | --------- | ---------------------------- |
| on/active  | `success` | Green chips, active hotspots |
| off        | `default` | Grey chips                   |
| online     | `success` | Green outlined chip          |
| offline    | `error`   | Red outlined chip            |

### Reusable Chips

Use `StatusChip` and `OnlineChip` from `components/common/StatusChips.tsx` for consistent status rendering across the application.

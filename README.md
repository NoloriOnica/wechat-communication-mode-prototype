# WeChat Communication Mode – MVP prototype

An interactive prototype of WeChat Communication Mode, a simplified mode designed for older users.

```
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## How it works

- **Start screen**: 7 scenarios plus a gallery of all 18 screens.
- **Player**: tap the buttons on the phone, or use Back / Next, the step list, or the ← → keys.
  Tapping a non-interactive area highlights the tappable areas; "Show tappable areas" keeps them visible.
- URLs: `#/play/<scenario>/<screen>` opens a specific step; `#/frame/<id>` shows a single screen.

## Where things are

| Path | What |
| --- | --- |
| `src/components/ui.jsx` | Design tokens and shared components (buttons, nav bar, banners, guide cards) |
| `src/components/iconPaths.js` | Icon SVG paths |
| `src/screens/bases.jsx` | Home, Contact page and Chat base layouts |
| `src/screens/screens.jsx` | Screens 01–18 and their links |
| `src/scenarios.js` | Scenario definitions (steps and hints) shown on the start screen |

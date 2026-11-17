# WeChat Lite Mode – MVP prototype

An interactive prototype of WeChat Lite Mode, a simplified mode designed for older users.

```
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## How it works

The start page has three tabs:

- **User Flows** (`#/`): 6 user flows (1, 2.1, 2.2, 3, 4, 5, matching the user flow diagrams). Each one opens a step-by-step player:
  tap the buttons on the phone, or use Back / Next, the step list, or the ← → keys.
  Tapping a non-interactive area highlights the tappable areas; "Show tappable areas" keeps them visible.
- **Full MVP** (`#/mvp`): a working phone where every button does something. It starts in standard WeChat
  (Me → Settings → Lite mode), and has real chats for all 6 contacts, typing, quick replies (add / edit / delete / reorder),
  voice messages, video calls, all Help guides, Ask family, text size, and switching back. Recording, calls and
  "Speak to type" are simulated; "Read aloud" uses the browser's voice. Demo controls: No internet, Receive a message,
  Incoming video call, Reset. State is saved in `localStorage`.
- **Screens** (`#/screens`): all 22 screens.

**Language**: the EN / 中文 switch changes both the website and the app. The choice is remembered; `?lang=zh` or `?lang=en` sets it.
Other URLs: `#/play/<flow>/<screen>` opens a specific step; `#/frame/<id>` shows a single screen.

## Where things are

| Path | What |
| --- | --- |
| `src/components/ui.jsx` | Design tokens and shared components (buttons, nav bar, banners, guide cards) |
| `src/components/iconPaths.js` | Icon SVG paths |
| `src/screens/bases.jsx` | Home, Contact page and Chat base layouts |
| `src/screens/screens.jsx` | Screens 01–18 and 22, their links, and the screen registry |
| `src/screens/wechat.jsx` | Screens 19–21: standard WeChat and the Settings toggle that switches on Lite mode |
| `src/scenarios.js` | User flow definitions (steps and hints) shown on the start screen |
| `src/mvp/` | Full MVP: state and actions (`state.js`), screens (`screens.jsx`), phone and guide spotlight (`MvpPhone.jsx`), guides (`guides.js`), Read aloud (`speech.js`), tab layout (`MvpView.jsx`) |

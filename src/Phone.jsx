import { useEffect, useRef, useState } from 'react';
import { NavCtx } from './components/ui.jsx';
import { SCREENS } from './screens/screens.jsx';

const W = 393;
const H = 852;

/** Renders one Figma frame at a given scale. Used for thumbnails (non-interactive). */
export function ScreenThumb({ id, scale }) {
  const S = SCREENS[id].C;
  return (
    <div style={{ width: W * scale, height: H * scale, overflow: 'hidden', position: 'relative' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none' }} aria-hidden="true">
        <NavCtx.Provider value={{ go: () => {}, interactive: false }}>
          <S />
        </NavCtx.Provider>
      </div>
    </div>
  );
}

/** Interactive screen. Tapping a non-link area briefly flashes the hotspots, like Figma prototypes. */
export function LiveScreen({ id, go, scale, showHotspots }) {
  const S = SCREENS[id].C;
  const [flash, setFlash] = useState(false);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);

  const onClick = () => {
    setFlash(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setFlash(false), 650);
  };

  return (
    <div style={{ width: W * scale, height: H * scale, overflow: 'hidden', position: 'relative' }}>
      <div
        className={`cm-live${flash || showHotspots ? ' cm-flash' : ''}`}
        style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: W, height: H }}
        onClick={onClick}
      >
        <NavCtx.Provider value={{ go, interactive: true }}>
          <div key={id} className="cm-enter">
            <S />
          </div>
        </NavCtx.Provider>
      </div>
    </div>
  );
}

export function useViewport() {
  const get = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [vp, setVp] = useState(get);
  useEffect(() => {
    const on = () => setVp(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

export const FRAME = { W, H };

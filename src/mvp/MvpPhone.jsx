// The Full MVP phone: renders the current route (plus any sheet on top), banners, toasts and guides.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { C, T, Abs, Banner, GuideBar, GuideCard, Glow, Pointer, NavCtx, useL, useLang } from '../components/ui.jsx';
import { contactById } from '../screens/bases.jsx';
import { DoneCard } from '../screens/screens.jsx';
import { FRAME } from '../Phone.jsx';
import { RouteView, OVERLAYS } from './screens.jsx';
import { GUIDES } from './guides.js';
import { speak, useSpeaking } from './speech.js';

const { W, H } = FRAME;
const keyOf = (r, i) => `${i}-${r.name}-${r.id || r.action || ''}`;

export function MvpPhone({ s, api, scale }) {
  const root = useRef(null);
  const [flash, setFlash] = useState(false);
  const flashT = useRef();
  useEffect(() => () => clearTimeout(flashT.current), []);

  const { stack } = s;
  const topIdx = stack.length - 1;
  let baseIdx = topIdx;
  while (baseIdx > 0 && OVERLAYS.has(stack[baseIdx].name)) baseIdx--;
  const base = stack[baseIdx];
  const top = stack[topIdx];

  // Banners stay ~3 s (FR-3.2); toasts a little shorter.
  useEffect(() => {
    if (!s.banner) return undefined;
    const id = setTimeout(api.clearBanner, 3200);
    return () => clearTimeout(id);
  }, [s.banner, api]);
  useEffect(() => {
    if (!s.toast) return undefined;
    const id = setTimeout(api.clearToast, 3000);
    return () => clearTimeout(id);
  }, [s.toast, api]);

  // Guides whose step lets taps through finish when their condition becomes true.
  useEffect(() => {
    const g = s.guide;
    if (!g) return;
    const st = GUIDES[g.id].steps[g.step];
    if (st && st.until && st.until(s, g.base)) api.guideAdvance();
  }, [s, api]);

  const onClick = () => {
    setFlash(true);
    clearTimeout(flashT.current);
    flashT.current = setTimeout(() => setFlash(false), 650);
  };

  return (
    <div style={{ width: W * scale, height: H * scale, overflow: 'hidden', position: 'relative' }}>
      <div
        ref={root}
        className={`cm-live${flash ? ' cm-flash' : ''}`}
        style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: W, height: H, position: 'relative' }}
        onClick={onClick}
      >
        <NavCtx.Provider value={{ go: () => {}, interactive: true }}>
          <div key={keyOf(base, baseIdx)} className="cm-enter" style={{ position: 'absolute', inset: 0 }}>
            <RouteView route={base} s={s} api={api} top={top} />
          </div>
          {topIdx > baseIdx && (
            <div key={keyOf(top, topIdx)} className="cm-enter" style={{ position: 'absolute', inset: 0 }}>
              <RouteView route={top} under={base} s={s} api={api} />
            </div>
          )}
          <Notices s={s} api={api} />
          {s.guide && <GuideOverlay s={s} api={api} root={root} scale={scale} />}
        </NavCtx.Provider>
      </div>
    </div>
  );
}

/* ---------------- banner + toast ---------------- */
function Notices({ s, api }) {
  const l = useL();
  const b = s.banner;
  const open = b && b.open && s.mode === 'lite';
  return (
    <>
      {b && (
        <div
          key={b.key}
          className="cm-drop"
          role={open ? 'button' : undefined}
          data-hot={open ? '' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            api.clearBanner();
            if (open) api.push({ name: 'chat', id: b.open });
          }}
          style={{ position: 'absolute', left: 16, top: 124, zIndex: 5 }}
        >
          <Banner
            type={b.type === 'error' ? 'error' : 'success'}
            title={l(b.title.en, b.title.cn)}
            message={open ? l('Tap to open', '点此打开') : undefined}
            h={open || b.type === 'error' ? undefined : 77}
            style={{ position: 'relative', left: 0, top: 0, minHeight: 77, height: open || b.type === 'error' ? 'auto' : 77 }}
          />
        </div>
      )}
      {s.toast && (
        <Abs
          key={s.toast.key}
          className="cm-drop"
          x={24}
          y={712}
          w={345}
          style={{ zIndex: 5, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ background: 'rgba(28,28,28,0.92)', borderRadius: 16, padding: '14px 18px' }}>
            <T w={500} s={18} lh={23} c={C.white} align="center">{l(s.toast.text.en, s.toast.text.cn)}</T>
          </div>
        </Abs>
      )}
    </>
  );
}

/* ---------------- guide spotlight ---------------- */
const PAD = 8;

function useTargetRect(root, scale, target) {
  const [rect, setRect] = useState(null);
  useLayoutEffect(() => {
    let raf;
    const tick = () => {
      const r = root.current;
      const els = r ? r.querySelectorAll(`[data-guide="${target}"]`) : [];
      const el = els[els.length - 1]; // the top-most copy (sheets render after the screen below)
      if (el && r) {
        const a = el.getBoundingClientRect();
        const b = r.getBoundingClientRect();
        const next = { x: (a.left - b.left) / scale, y: (a.top - b.top) / scale, w: a.width / scale, h: a.height / scale };
        setRect((p) => (p && Math.abs(p.x - next.x) < 0.5 && Math.abs(p.y - next.y) < 0.5 && Math.abs(p.w - next.w) < 0.5 && Math.abs(p.h - next.h) < 0.5 ? p : next));
      } else setRect(null);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [root, scale, target]);
  return rect;
}

function GuideOverlay({ s, api, root, scale }) {
  const l = useL();
  const lang = useLang();
  const reading = useSpeaking();
  const g = s.guide;
  const def = GUIDES[g.id];
  const st = def.steps[g.step];
  const rect = useTargetRect(root, scale, st ? st.target : '__none__');
  const block = (e) => e.stopPropagation();

  if (!st) {
    // Finished: same card as frame 14.
    return (
      <div onClick={block} style={{ position: 'absolute', inset: 0, zIndex: 6 }}>
        <DoneCard text={[def.done.en, def.done.cn]} done={api.endGuide} again={() => api.startGuide(g.id, g.ctx)} />
      </div>
    );
  }

  const c = contactById(g.ctx && g.ctx.id);
  const text = typeof st.text === 'function' ? st.text(c) : st.text;
  const n = def.steps.length;
  const step = [`Step ${g.step + 1} of ${n}`, `第${g.step + 1}步，共${n}步`];
  const dim = 'rgba(0,0,0,0.62)';

  if (!rect) {
    return <div onClick={block} style={{ position: 'absolute', inset: 0, zIndex: 6, background: dim }} />;
  }
  const hx = Math.max(0, rect.x - PAD);
  const hy = Math.max(0, rect.y - PAD);
  const hw = Math.min(W, rect.x + rect.w + PAD) - hx;
  const hh = Math.min(H, rect.y + rect.h + PAD) - hy;
  const below = hy + hh / 2 < H / 2;
  const cardStyle = below ? {} : { top: 'auto', bottom: H - hy + 18 };
  const piece = (x, y, w, h) => <Abs x={x} y={y} w={w} h={h} onClick={block} style={{ background: dim }} />;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        {piece(0, 0, W, hy)}
        {piece(0, hy + hh, W, H - hy - hh)}
        {piece(0, hy, hx, hh)}
        {piece(hx + hw, hy, W - hx - hw, hh)}
        {!st.pass && (
          <Abs
            x={hx}
            y={hy}
            w={hw}
            h={hh}
            data-hot=""
            role="button"
            aria-label={l(text.en, text.cn)}
            onClick={(e) => {
              e.stopPropagation();
              api.guideNext();
            }}
            style={{ cursor: 'pointer', borderRadius: 22 }}
          />
        )}
      </div>
      <Glow x={hx} y={hy} w={hw} h={hh} r={22} />
      {!st.pass && <Pointer x={hx + hw / 2 - 10} y={hy + hh / 2 - 6} />}
      <div style={{ pointerEvents: 'auto' }} onClick={block}>
        {!def.noBar && <GuideBar exit={api.endGuide} title={[def.title.en, def.title.cn]} />}
        <GuideCard
          y={below ? Math.min(hy + hh + 18, H - 300) : undefined}
          style={cardStyle}
          step={step}
          title={text.en}
          cn={text.cn}
          close={api.endGuide}
          next={api.guideNext}
          read={() => speak(l(text.en, text.cn), lang, 'guide')}
          reading={reading === 'guide'}
        />
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { SCENARIOS, ALL_SCREENS, findScenario } from './scenarios.js';
import { SCREENS } from './screens/screens.jsx';
import { LiveScreen, ScreenThumb, useViewport, FRAME } from './Phone.jsx';

/* ---------------- hash routing: #/play/<scenario>/<screen> ---------------- */
function parseHash() {
  const [, view, sid, screen] = window.location.hash.replace(/^#/, '').split('/');
  // #/frame/<id> renders one bare frame at 1x (used for pixel comparison with Figma exports)
  if (view === 'frame' && SCREENS[sid]) return { view: 'frame', screen: sid };
  if (view === 'play' && findScenario(sid)) {
    const sc = findScenario(sid);
    return { view: 'play', sid, screen: SCREENS[screen] ? screen : sc.steps[0] };
  }
  return { view: 'start' };
}

function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const nav = useCallback((r) => {
    window.location.hash = r.view === 'play' ? `/play/${r.sid}/${r.screen}` : '/';
  }, []);
  return [route, nav];
}

export default function App() {
  const [route, nav] = useRoute();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.view, route.sid]);
  if (route.view === 'frame') return <ScreenThumb id={route.screen} scale={1} />;
  if (route.view === 'play') return <Player sid={route.sid} screen={route.screen} nav={nav} />;
  return <Start nav={nav} />;
}

/* ================================ Start ================================ */
function Start({ nav }) {
  const open = (sid, screen) => nav({ view: 'play', sid, screen: screen || findScenario(sid).steps[0] });
  return (
    <div className="start">
      <header className="start-hero">
        <div className="brand">
          <span className="brand-dot" />
          SC4025 Group 5 · MVP prototype
        </div>
        <h1>
          WeChat <em>Communication Mode</em>
        </h1>
        <p className="lede">
          An elderly-friendly, communication-first interface. Labels in English and Simplified Chinese. Pick a scenario
          to walk through it, and tap the real buttons on the phone to move between screens.
        </p>
        <p className="lede-cn">适合长辈的沟通模式 · 选择一个场景开始演示</p>
      </header>

      <section>
        <div className="section-head">
          <h2>Scenarios</h2>
          <span>{SCENARIOS.length} cases</span>
        </div>
        <div className="cards">
          {SCENARIOS.map((s, i) => (
            <button key={s.id} className="card" onClick={() => open(s.id)}>
              <div className="card-thumbs">
                {s.steps.slice(0, 3).map((id, k) => (
                  <div key={id} className="card-thumb" style={{ '--k': k }}>
                    <ScreenThumb id={id} scale={0.26} />
                  </div>
                ))}
              </div>
              <div className="card-body">
                <div className="card-num">Case {i + 1}</div>
                <h3>{s.title}</h3>
                <div className="card-cn">{s.cn}</div>
                <p>{s.summary}</p>
                <div className="card-path">
                  {s.steps.map((id, k) => (
                    <span key={id}>
                      {k > 0 && <i>→</i>}
                      <b>{id}</b>
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>All screens</h2>
          <span>18 screens</span>
        </div>
        <div className="gallery">
          {ALL_SCREENS.steps.map((id) => (
            <button key={id} className="g-item" onClick={() => open('all', id)}>
              <div className="g-thumb">
                <ScreenThumb id={id} scale={0.3} />
              </div>
              <div className="g-label">
                <b>{id}</b> {SCREENS[id].title}
              </div>
            </button>
          ))}
        </div>
      </section>

      <footer className="start-foot">Linked to PRD Section 4.1 and user stories Section 4.2.</footer>
    </div>
  );
}

/* ================================ Player ================================ */
function Player({ sid, screen, nav }) {
  const sc = findScenario(sid);
  const vp = useViewport();
  const mobile = vp.w <= 820;
  const [showHot, setShowHot] = useState(false);
  const [menu, setMenu] = useState(false);

  const idx = sc.steps.indexOf(screen);
  const [lastIdx, setLastIdx] = useState(Math.max(idx, 0));
  useEffect(() => {
    if (idx >= 0) setLastIdx(idx);
  }, [idx]);
  const pos = idx >= 0 ? idx : lastIdx;

  const go = useCallback((id) => nav({ view: 'play', sid, screen: id }), [nav, sid]);
  const prev = () => pos > 0 && go(sc.steps[pos - 1]);
  const next = () => pos < sc.steps.length - 1 && go(sc.steps[pos + 1]);
  const home = () => nav({ view: 'start' });

  useEffect(() => {
    const on = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') home();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const meta = SCREENS[screen];
  const hint = sc.hints[screen];

  if (mobile) {
    const bar = 64;
    const scale = Math.min(vp.w / FRAME.W, (vp.h - bar) / FRAME.H);
    return (
      <div className="m-player">
        <div className="m-stage" style={{ height: vp.h - bar }}>
          <LiveScreen id={screen} go={go} scale={scale} showHotspots={showHot} />
        </div>
        <div className="m-bar" style={{ height: bar }}>
          <button className="m-btn" onClick={() => setMenu(true)} aria-label="Scenario steps">
            <MenuIcon />
          </button>
          <button className="m-btn" onClick={prev} disabled={pos === 0} aria-label="Previous screen">
            ‹
          </button>
          <div className="m-title">
            <span>
              {idx >= 0 ? `${pos + 1} / ${sc.steps.length}` : 'Off path'} · {screen}
            </span>
            {meta.title}
          </div>
          <button className="m-btn" onClick={next} disabled={pos === sc.steps.length - 1} aria-label="Next screen">
            ›
          </button>
        </div>
        {menu && (
          <div className="m-sheet-wrap" onClick={() => setMenu(false)}>
            <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="back-link" onClick={home}>
                ← All scenarios
              </button>
              <StepPanel sc={sc} screen={screen} go={(id) => (go(id), setMenu(false))} hint={hint} meta={meta} />
              <label className="hot-toggle">
                <input type="checkbox" checked={showHot} onChange={(e) => setShowHot(e.target.checked)} /> Show tappable
                areas
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }

  const bezel = 14;
  const avail = vp.h - 56 - 84 - 32;
  const scale = Math.min(1, avail / (FRAME.H + bezel * 2));
  return (
    <div className="player">
      <div className="topbar">
        <button className="back-link" onClick={home}>
          ← All scenarios
        </button>
        <div className="topbar-title">
          WeChat Communication Mode <span>· prototype</span>
        </div>
        <label className="hot-toggle">
          <input type="checkbox" checked={showHot} onChange={(e) => setShowHot(e.target.checked)} /> Show tappable areas
        </label>
      </div>
      <div className="player-main">
        <aside className="side">
          <StepPanel sc={sc} screen={screen} go={go} hint={hint} meta={meta} />
        </aside>
        <div className="stage">
          <div className="device" style={{ padding: bezel * scale, borderRadius: 58 * scale }}>
            <div className="device-screen" style={{ borderRadius: 44 * scale }}>
              <LiveScreen id={screen} go={go} scale={scale} showHotspots={showHot} />
            </div>
          </div>
          <div className="controls">
            <button className="ctl" onClick={prev} disabled={pos === 0}>
              ‹ Back
            </button>
            <div className="dots">
              {sc.steps.map((id, k) => (
                <button
                  key={id}
                  className={`dot${id === screen ? ' on' : ''}${k < pos ? ' done' : ''}`}
                  onClick={() => go(id)}
                  aria-label={`Screen ${id}`}
                />
              ))}
            </div>
            <button className="ctl primary" onClick={next} disabled={pos === sc.steps.length - 1}>
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPanel({ sc, screen, go, hint, meta }) {
  return (
    <div className="steps">
      <div className="steps-head">
        <h2>{sc.title}</h2>
        <div className="steps-cn">{sc.cn}</div>
        <p>{sc.summary}</p>
      </div>
      <ol>
        {sc.steps.map((id, k) => (
          <li key={id}>
            <button className={`step${id === screen ? ' on' : ''}`} onClick={() => go(id)}>
              <span className="step-n">{id}</span>
              <span className="step-t">
                {SCREENS[id].title}
                {id === screen && sc.hints[id] && <small>{sc.hints[id]}</small>}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="note">
        <div className="note-k">
          Design note · {screen} · {meta.refs}
        </div>
        <p>{meta.caption}</p>
        {!sc.steps.includes(screen) && <p className="note-off">This screen is outside the scenario path. Use the steps above to return.</p>}
        {!hint && sc.id === 'all' && <p className="note-tip">Tip: tap anywhere on the phone to reveal the tappable areas.</p>}
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

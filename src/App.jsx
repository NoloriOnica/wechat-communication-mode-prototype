import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SCENARIOS, ALL_SCREENS, findScenario } from './scenarios.js';
import { SCREENS } from './screens/screens.jsx';
import { LiveScreen, ScreenThumb, useViewport, FRAME } from './Phone.jsx';
import { LangCtx, useL } from './components/ui.jsx';
import { MvpView, MobileMvp } from './mvp/MvpView.jsx';

/* ---------------- hash routing ----------------
   #/            User Flows tab      #/mvp   Full MVP tab      #/screens   Screens tab
   #/play/<flow>/<screen>   step-through player      #/frame/<id>   one bare frame */
function parseHash() {
  const [, view, sid, screen] = window.location.hash.replace(/^#/, '').split('/');
  // #/frame/<id> renders one bare frame at 1x
  if (view === 'frame' && SCREENS[sid]) return { view: 'frame', screen: sid };
  if (view === 'play' && findScenario(sid)) {
    const sc = findScenario(sid);
    return { view: 'play', sid, screen: SCREENS[screen] ? screen : sc.steps[0] };
  }
  if (view === 'mvp' || view === 'screens') return { view: 'start', tab: view };
  return { view: 'start', tab: 'flows' };
}

function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const nav = useCallback((r) => {
    window.location.hash = r.view === 'play' ? `/play/${r.sid}/${r.screen}` : `/${r.tab && r.tab !== 'flows' ? r.tab : ''}`;
  }, []);
  return [route, nav];
}

/* ---------------- language: English or Chinese, remembered between visits ---------------- */
const SetLangCtx = createContext(() => {});

function useLangState() {
  const [lang, setLang] = useState(() => {
    // ?lang=zh or ?lang=en in the URL wins, otherwise the last choice
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'zh' || q === 'en') return q;
    try {
      return localStorage.getItem('lang') === 'zh' ? 'zh' : 'en';
    } catch {
      return 'en';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* storage unavailable */
    }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = lang === 'zh' ? '微信简易模式 – MVP 原型' : 'WeChat Lite Mode – MVP prototype';
  }, [lang]);
  return [lang, setLang];
}

function LangSwitch({ dark }) {
  const lang = useContext(LangCtx);
  const setLang = useContext(SetLangCtx);
  return (
    <div className={`lang-switch${dark ? ' dark' : ''}`} role="group" aria-label="Language / 语言">
      <button className={lang === 'en' ? 'on' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
        EN
      </button>
      <button className={lang === 'zh' ? 'on' : ''} aria-pressed={lang === 'zh'} onClick={() => setLang('zh')}>
        中文
      </button>
    </div>
  );
}

export default function App() {
  const [route, nav] = useRoute();
  const [lang, setLang] = useLangState();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.view, route.sid]);
  const vp = useViewport();
  let view;
  if (route.view === 'frame') view = <ScreenThumb id={route.screen} scale={1} />;
  else if (route.view === 'play') view = <Player sid={route.sid} screen={route.screen} nav={nav} />;
  else if (route.tab === 'mvp' && vp.w <= 820) view = <MobileMvp onExit={() => nav({ view: 'start', tab: 'flows' })} langSwitch={<LangSwitch dark />} />;
  else view = <Start tab={route.tab} nav={nav} />;
  return (
    <SetLangCtx.Provider value={setLang}>
      <LangCtx.Provider value={lang}>{view}</LangCtx.Provider>
    </SetLangCtx.Provider>
  );
}

/* ================================ Start ================================ */
const TABS = [
  { id: 'flows', en: 'User Flows', cn: '用户流程' },
  { id: 'mvp', en: 'Full MVP', cn: '完整 MVP' },
  { id: 'screens', en: 'Screens', cn: '全部页面' },
];

function Start({ tab, nav }) {
  const l = useL();
  const open = (sid, screen) => nav({ view: 'play', sid, screen: screen || findScenario(sid).steps[0] });
  return (
    <div className="start">
      <div className="start-top">
        <div className="brand">
          <span className="brand-dot" />
          {l('SC4025 Group 5 · MVP prototype', 'SC4025 第5组 · MVP 原型')}
        </div>
        <LangSwitch />
      </div>
      <header className="start-hero">
        <h1>{l(<>WeChat <em>Lite Mode</em></>, <>微信<em>简易模式</em></>)}</h1>
        <p className="lede">
          {l(
            'An elderly-friendly, communication-first interface. Walk through a user flow, try the full working MVP, or browse every screen.',
            '一个适合长辈、以沟通为主的界面。可以按用户流程演示、试用完整可用的 MVP，或浏览全部页面。',
          )}
        </p>
      </header>

      <nav className="tabs" role="tablist" aria-label={l('Sections', '栏目')}>
        {TABS.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={tab === x.id}
            className={tab === x.id ? 'on' : ''}
            onClick={() => nav({ view: 'start', tab: x.id })}
          >
            {l(x.en, x.cn)}
          </button>
        ))}
      </nav>

      {tab === 'mvp' && <MvpView />}

      {tab === 'flows' && (
      <section>
        <div className="section-head">
          <h2>{l('User flows', '用户流程')}</h2>
          <span>{l(`${SCENARIOS.length} flows`, `共 ${SCENARIOS.length} 个流程`)}</span>
        </div>
        <div className="cards">
          {SCENARIOS.map((s) => (
            <button key={s.id} className="card" onClick={() => open(s.id)}>
              <div className="card-thumbs">
                {s.steps.slice(0, 3).map((id, k) => (
                  <div key={id} className="card-thumb" style={{ '--k': k }}>
                    <ScreenThumb id={id} scale={0.26} />
                  </div>
                ))}
              </div>
              <div className="card-body">
                <div className="card-num">{l(`User flow ${s.flow}`, `用户流程 ${s.flow}`)}</div>
                <h3>{l(s.title, s.cn)}</h3>
                <p>{l(s.summary, s.summaryCn)}</p>
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
      )}

      {tab === 'screens' && (
      <section>
        <div className="section-head">
          <h2>{l('All screens', '全部页面')}</h2>
          <span>{l(`${ALL_SCREENS.steps.length} screens`, `共 ${ALL_SCREENS.steps.length} 个页面`)}</span>
        </div>
        <div className="gallery">
          {ALL_SCREENS.steps.map((id) => (
            <button key={id} className="g-item" onClick={() => open('all', id)}>
              <div className="g-thumb">
                <ScreenThumb id={id} scale={0.3} />
              </div>
              <div className="g-label">
                <b>{id}</b> {l(SCREENS[id].title, SCREENS[id].titleCn)}
              </div>
            </button>
          ))}
        </div>
      </section>
      )}

      <footer className="start-foot">
        {l('Linked to PRD Section 4.1 and user stories Section 4.2.', '对应 PRD 第 4.1 节和用户故事第 4.2 节。')}
      </footer>
    </div>
  );
}

/* ================================ Player ================================ */
function Player({ sid, screen, nav }) {
  const l = useL();
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
  const home = () => nav({ view: 'start', tab: sid === 'all' ? 'screens' : 'flows' });

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
  const hint = l(sc.hints, sc.hintsCn)[screen];
  const hotToggle = (
    <label className="hot-toggle">
      <input type="checkbox" checked={showHot} onChange={(e) => setShowHot(e.target.checked)} />{' '}
      {l('Show tappable areas', '显示可点击区域')}
    </label>
  );

  if (mobile) {
    const bar = 64;
    const scale = Math.min(vp.w / FRAME.W, (vp.h - bar) / FRAME.H);
    return (
      <div className="m-player">
        <div className="m-stage" style={{ height: vp.h - bar }}>
          <LiveScreen id={screen} go={go} scale={scale} showHotspots={showHot} />
        </div>
        <div className="m-bar" style={{ height: bar }}>
          <button className="m-btn" onClick={() => setMenu(true)} aria-label={l('Flow steps', '流程步骤')}>
            <MenuIcon />
          </button>
          <button className="m-btn" onClick={prev} disabled={pos === 0} aria-label={l('Previous screen', '上一页')}>
            ‹
          </button>
          <div className="m-title">
            <span>
              {idx >= 0 ? `${pos + 1} / ${sc.steps.length}` : l('Off path', '不在路径上')} · {screen}
            </span>
            {l(meta.title, meta.titleCn)}
          </div>
          <button className="m-btn" onClick={next} disabled={pos === sc.steps.length - 1} aria-label={l('Next screen', '下一页')}>
            ›
          </button>
          <LangSwitch dark />
        </div>
        {menu && (
          <div className="m-sheet-wrap" onClick={() => setMenu(false)}>
            <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="back-link" onClick={home}>
                {sid === 'all' ? l('← All screens', '← 全部页面') : l('← All user flows', '← 全部流程')}
              </button>
              <StepPanel sc={sc} screen={screen} go={(id) => (go(id), setMenu(false))} hint={hint} meta={meta} />
              {hotToggle}
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
          {sid === 'all' ? l('← All screens', '← 全部页面') : l('← All user flows', '← 全部流程')}
        </button>
        <div className="topbar-title">
          {l('WeChat Lite Mode', '微信简易模式')} <span>· {l('prototype', '原型')}</span>
        </div>
        <div className="topbar-right">
          {hotToggle}
          <LangSwitch />
        </div>
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
              {l('‹ Back', '‹ 上一步')}
            </button>
            <div className="dots">
              {sc.steps.map((id, k) => (
                <button
                  key={id}
                  className={`dot${id === screen ? ' on' : ''}${k < pos ? ' done' : ''}`}
                  onClick={() => go(id)}
                  aria-label={l(`Screen ${id}`, `页面 ${id}`)}
                />
              ))}
            </div>
            <button className="ctl primary" onClick={next} disabled={pos === sc.steps.length - 1}>
              {l('Next ›', '下一步 ›')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPanel({ sc, screen, go, hint, meta }) {
  const l = useL();
  const hints = l(sc.hints, sc.hintsCn);
  return (
    <div className="steps">
      <div className="steps-head">
        <h2>{l(sc.title, sc.cn)}</h2>
        <p>{l(sc.summary, sc.summaryCn)}</p>
      </div>
      <ol>
        {sc.steps.map((id) => (
          <li key={id}>
            <button className={`step${id === screen ? ' on' : ''}`} onClick={() => go(id)}>
              <span className="step-n">{id}</span>
              <span className="step-t">
                {l(SCREENS[id].title, SCREENS[id].titleCn)}
                {id === screen && hints[id] && <small>{hints[id]}</small>}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="note">
        <div className="note-k">
          {l('Design note', '设计说明')} · {screen} · {l(meta.refs, meta.refsCn)}
        </div>
        <p>{l(meta.caption, meta.captionCn)}</p>
        {!sc.steps.includes(screen) && (
          <p className="note-off">
            {l('This screen is outside the user flow. Use the steps above to return.', '此页面不在流程路径上，请用上面的步骤返回。')}
          </p>
        )}
        {!hint && sc.id === 'all' && (
          <p className="note-tip">
            {l('Tip: tap anywhere on the phone to reveal the tappable areas.', '提示：点手机上任意位置，即可显示可点击区域。')}
          </p>
        )}
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

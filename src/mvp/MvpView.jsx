// The "Full MVP" tab: a working phone plus a panel of things to try and demo controls.
import { useState } from 'react';
import { useL } from '../components/ui.jsx';
import { useViewport, FRAME } from '../Phone.jsx';
import { useMvp } from './state.js';
import { MvpPhone } from './MvpPhone.jsx';
import { canSpeak } from './speech.js';

const TRY = [
  ['Me → Settings → turn on Lite mode', '我 → 设置 → 打开简易模式'],
  ['Tap a family photo, then send a message or a quick reply', '点家人的照片，发一条消息或快捷回复'],
  ['Record and send a voice message', '录一条语音并发送'],
  ['Make a video call (and end it)', '打一个视频电话（然后挂断）'],
  ['Help → pick any task for a step-by-step guide', '帮助 → 选任意一项，看分步教学'],
  ['Help → Ask family, then wait for Son’s reply', '帮助 → 家人帮忙，然后等儿子回复'],
  ['Settings → edit quick replies or make text bigger', '设置 → 编辑快捷回复或放大字体'],
  ['Turn on “No internet”, send a message, then Try again', '打开“没有网络”，发一条消息，然后点“重试”'],
];

function Controls({ s, api, after = () => {} }) {
  const l = useL();
  return (
    <div className="mvp-controls">
      <div className="mvp-k">{l('Demo controls', '演示控制')}</div>
      <label className="mvp-switch">
        <input type="checkbox" checked={s.offline} onChange={(e) => api.setOffline(e.target.checked)} />
        <span>
          <b>{l('No internet', '没有网络')}</b>
          {l('Messages fail until you turn this off and tap Try again.', '关闭前消息都会发送失败，关闭后点“重试”。')}
        </span>
      </label>
      <div className="mvp-btns">
        <button className="ctl" onClick={() => (api.receive(), after())}>{l('Receive a message', '收到一条消息')}</button>
        <button className="ctl" onClick={() => (api.incomingCall('daughter'), after())}>{l('Incoming video call', '来电（视频）')}</button>
        <button className="ctl danger" onClick={() => (api.reset(), after())}>{l('Reset MVP', '重置 MVP')}</button>
      </div>
      <p className="mvp-small">
        {l(
          'Recording, calls and “Speak to type” are simulated. “Read aloud” uses your browser’s voice. Messages and settings are saved in this browser until you reset.',
          '录音、通话和“说话打字”是模拟的。“朗读”使用浏览器自带的语音。消息和设置会保存在本浏览器中，直到重置。',
        )}
        {!canSpeak() && ` ${l('(This browser cannot read aloud.)', '（此浏览器不支持朗读。）')}`}
      </p>
    </div>
  );
}

/** Desktop / tablet: device frame + side panel. */
export function MvpView() {
  const l = useL();
  const [s, api] = useMvp();
  const vp = useViewport();
  const bezel = 14;
  const scale = Math.min(1, Math.max(0.55, (vp.h - 60) / (FRAME.H + bezel * 2)));
  return (
    <section className="mvp">
      <div className="mvp-stage">
        <div className="device" style={{ padding: bezel * scale, borderRadius: 58 * scale }}>
          <div className="device-screen" style={{ borderRadius: 44 * scale }}>
            <MvpPhone s={s} api={api} scale={scale} />
          </div>
        </div>
      </div>
      <aside className="mvp-side">
        <h2>{l('Full MVP', '完整 MVP')}</h2>
        <p className="mvp-lede">
          {l(
            'A working version of WeChat Lite mode. Every button does something: chats, voice messages, calls, guides, settings and quick replies all work.',
            '可以实际使用的微信简易模式。每个按钮都有作用：聊天、语音、通话、教学、设置和快捷回复都能用。',
          )}
        </p>
        <div className="mvp-k">{l('Things to try', '可以试试')}</div>
        <ol className="mvp-try">
          {TRY.map(([en, cn]) => (
            <li key={en}>{l(en, cn)}</li>
          ))}
        </ol>
        <Controls s={s} api={api} />
      </aside>
    </section>
  );
}

/** Phones: the MVP fills the screen, with a small bar for the menu and language. */
export function MobileMvp({ onExit, langSwitch }) {
  const l = useL();
  const [s, api] = useMvp();
  const vp = useViewport();
  const [menu, setMenu] = useState(false);
  const bar = 64;
  const scale = Math.min(vp.w / FRAME.W, (vp.h - bar) / FRAME.H);
  return (
    <div className="m-player">
      <div className="m-stage" style={{ height: vp.h - bar }}>
        <MvpPhone s={s} api={api} scale={scale} />
      </div>
      <div className="m-bar" style={{ height: bar }}>
        <button className="m-btn" onClick={onExit} aria-label={l('Back to the website', '返回网站')}>‹</button>
        <div className="m-title">
          <span>{l('Prototype', '原型')}</span>
          {l('Full MVP', '完整 MVP')}
        </div>
        <button className="m-btn" onClick={() => setMenu(true)} aria-label={l('Demo controls', '演示控制')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        {langSwitch}
      </div>
      {menu && (
        <div className="m-sheet-wrap" onClick={() => setMenu(false)}>
          <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
            <Controls s={s} api={api} after={() => setMenu(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

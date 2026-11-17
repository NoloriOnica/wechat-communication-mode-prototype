// Full MVP screens. They reuse the Figma-matched bases and overlays and wire every control to real actions.
import { useEffect, useState } from 'react';
import {
  C, T, Icon, Photo, Abs, Btn, Dim, Sheet, Screen, StatusBar, NavBar, ActionPill, NavCtx, useHot, useL, useLang, stroke,
} from '../components/ui.jsx';
import { HomeBase, ContactBase, ChatBase, CONTACTS, contactById, Row, Bubble, Avatar } from '../screens/bases.jsx';
import { RecorderSheet, CallConfirm, ErrorPanel, AskSheet, HelpSheet, ReplyEditor, clock } from '../screens/screens.jsx';
import { WxChats, WxContacts, WxDiscover, WxMe, SettingsBase, LiteConfirmSheet } from '../screens/wechat.jsx';
import { speak, useSpeaking } from './speech.js';
import { SPEAK_SAMPLE, MAX_REPLIES, t } from './state.js';
import { SAY_SAMPLE } from './guides.js';

/** Routes drawn as a sheet or card over the screen below them. */
export const OVERLAYS = new Set(['picker', 'help', 'ask', 'record', 'callConfirm', 'wxConfirm', 'switchBack']);

const OUT_OF_SCOPE = t('This part of WeChat is not in the prototype. Try Me → Settings → Lite mode.', '原型没有包含这部分。试试“我 → 设置 → 简易模式”。');
const name = (c) => [c.name, c.cn];

/* ======================= small shared pieces ======================= */

function useText() {
  const l = useL();
  return (x) => (x == null ? '' : typeof x === 'string' ? x : l(x.en, x.cn));
}

/** Listening sheet used by "Speak to type" and "Say what you need" (simulated speech). */
function ListenSheet({ title, result, useLabel, onUse, onCancel }) {
  const l = useL();
  const [heard, setHeard] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setHeard(true), 1800);
    return () => clearTimeout(id);
  }, []);
  const bars = [14, 26, 40, 22, 48, 30, 18, 36, 52, 28, 16, 34, 44, 20];
  return (
    <>
      <Dim op={0.45} to={onCancel} />
      <Sheet y={470} pad="22px 24px 34px 24px" gap={16} align="center">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 29 }}>
          {!heard && <div className="cm-rec-dot" style={{ width: 14, height: 14, borderRadius: 7, background: '#e5484d' }} />}
          <T w={700} s={24} lh={29} nowrap>{heard ? l('Is this right?', '是这样吗？') : l(...title)}</T>
        </div>
        <div style={{ height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 345, background: C.field, borderRadius: 16 }}>
          {heard ? (
            <T w={600} s={22} lh={28} align="center" style={{ padding: '0 16px' }}>{l(result.en, result.cn)}</T>
          ) : (
            <div className="cm-wave" style={{ height: 56, display: 'flex', alignItems: 'center', gap: 5 }}>
              {bars.map((h, i) => (
                <div key={i} style={{ width: 6, height: h, borderRadius: 3, background: C.green, animationDelay: `${(i % 7) * 0.11}s` }} />
              ))}
            </div>
          )}
        </div>
        <T s={16} lh={20} c={C.sub} nowrap>
          {heard ? l('Simulated speech – no microphone is used.', '模拟语音，不会使用麦克风。') : l('Speak now…', '请说话…')}
        </T>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn kind="neutral" icon="x" label="Cancel" cn="取消" w={167} to={onCancel} />
          <Btn
            kind="primary"
            icon="check"
            label={useLabel[0]}
            cn={useLabel[1]}
            w={167}
            to={heard ? onUse : undefined}
            style={heard ? undefined : { opacity: 0.4 }}
          />
        </div>
      </Sheet>
    </>
  );
}

/** Round button for call screens. */
function RoundBtn({ icon, label, color, to, g, on, size = 76 }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div {...hot} data-guide={g} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 110 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          background: color || (on ? C.white : 'rgba(255,255,255,0.22)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={size * 0.42} color={on ? C.text : C.white} />
      </div>
      <T w={600} s={18} lh={22} c={C.white} nowrap>{l(...label)}</T>
    </div>
  );
}

/* ======================= Lite: Home, picker, contact ======================= */

function Home({ api }) {
  const links = { settings: () => api.push({ name: 'settings' }), help: () => api.push({ name: 'help' }) };
  CONTACTS.forEach((c) => (links[c.id] = () => api.push({ name: 'contact', id: c.id })));
  links.messages = () => api.push({ name: 'picker', action: 'message' });
  links.voice = () => api.push({ name: 'picker', action: 'voice' });
  links.video = () => api.push({ name: 'picker', action: 'video' });
  return <HomeBase links={links} />;
}

const PICK = {
  message: { title: ['Who do you want to message?', '你想给谁发消息？'], route: 'chat' },
  voice: { title: ['Who is the voice message for?', '语音发给谁？'], route: 'record' },
  video: { title: ['Who do you want to video call?', '你想和谁视频通话？'], route: 'callConfirm' },
};

function PickTile({ c, to }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div
      {...hot}
      style={{ width: 107, height: 128, borderRadius: 18, background: C.field, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}
    >
      <Photo src={c.photo} size={76} />
      <T w={600} s={17} lh={21} nowrap>{l(c.name, c.cn)}</T>
    </div>
  );
}

function Picker({ route, api }) {
  const l = useL();
  const p = PICK[route.action];
  return (
    <>
      <Dim op={0.45} to={api.back} />
      <Sheet y={338} pad="22px 24px 34px 24px" gap={16}>
        <T w={700} s={24} lh={29} nowrap>{l(...p.title)}</T>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {CONTACTS.map((c) => (
            <PickTile key={c.id} c={c} to={() => api.replace({ name: p.route, id: c.id })} />
          ))}
        </div>
        <Btn kind="neutral" icon="x" label="Cancel" cn="取消" w={345} to={api.back} />
      </Sheet>
    </>
  );
}

function Contact({ route, api }) {
  const id = route.id;
  return (
    <ContactBase
      contact={contactById(id)}
      links={{
        back: api.back,
        home: api.home,
        message: () => api.push({ name: 'chat', id }),
        voice: () => api.push({ name: 'record', id }),
        video: () => api.push({ name: 'callConfirm', id }),
        help: () => api.push({ name: 'help' }),
        showMe: () => api.startGuide('showme', { id }),
      }}
    />
  );
}

/* ======================= Lite: Chat ======================= */

function ReadPill({ text, id }) {
  const l = useL();
  const lang = useLang();
  const reading = useSpeaking() === id;
  return <ActionPill icon="volume" text={reading ? l('Stop reading', '停止朗读') : l('Read aloud', '朗读')} to={() => speak(text, lang, id)} />;
}

function VoiceBubble({ m, out }) {
  const l = useL();
  const lang = useLang();
  const tx = useText();
  const speaking = useSpeaking() === m.id;
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setTimeout(() => setPlaying(false), Math.min(m.dur, 6) * 1000);
    return () => clearTimeout(id);
  }, [playing, m.dur]);
  // Incoming voice: "playing" reads the words aloud. Your own recording is simulated.
  const on = out ? playing : speaking;
  const play = useHot(() => (out ? setPlaying(!playing) : speak(tx(m.text), lang, m.id)));
  return (
    <div
      {...play}
      style={{
        minWidth: out ? 216 : 218,
        height: out ? 48 : 50,
        boxSizing: 'border-box',
        padding: out ? '12px 16px 12px 40px' : '12px 40px 12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: out ? 'flex-end' : 'flex-start',
        gap: 10,
        background: out ? (m.status === 'failed' ? 'rgba(149,236,105,0.6)' : C.bubble) : C.white,
        borderRadius: 14,
      }}
    >
      {!out && <Icon name="volume" size={26} color={on ? C.green : C.text} />}
      <T w={600} s={20} lh={24} nowrap>
        {on ? l('Playing…', '播放中…') : l('Voice', '语音')}  {clock(m.dur)}
      </T>
      {out && <Icon name={on ? 'volume' : 'check'} size={24} color={C.greenDark} />}
    </div>
  );
}

function MsgView({ m, c, size }) {
  const l = useL();
  const tx = useText();
  const [showText, setShowText] = useState(false);
  const fs = size === 'xlarge' ? { s: 25, lh: 31 } : { s: 20, lh: 24 };
  if (m.kind === 'date') return <T s={15} lh={18} c="#8c8c8c" align="center" nowrap>{tx(m.text)}</T>;
  const mine = m.from === 'me';
  const failed = m.status === 'failed';
  const alert = failed && <Icon name="alert" size={26} color="#dc6803" />;
  const faded = failed ? { background: 'rgba(149,236,105,0.6)' } : undefined;

  if (m.kind === 'help') {
    return (
      <Row end center>
        {alert}
        <Bubble out w={250} style={{ ...faded, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="users" size={22} color={C.greenDark} />
            <T w={700} s={18} lh={22} nowrap>{l('Help request', '求助')}</T>
          </div>
          <T w={500} s={fs.s - 2} lh={fs.lh - 2}>{l('Hi, I need help with WeChat. Here is my screen.', '我需要帮忙使用微信，这是我的屏幕。')}</T>
          <div style={{ height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px' }}>
            <Icon name="home" size={20} color={C.sub} />
            <T s={15} lh={18} c={C.sub} nowrap>{l('Screenshot attached', '已附屏幕截图')}</T>
          </div>
        </Bubble>
      </Row>
    );
  }

  if (m.kind === 'voice') {
    if (mine)
      return (
        <Row end center>
          {alert}
          <VoiceBubble m={m} out />
        </Row>
      );
    return (
      <>
        <Row>
          <Avatar src={c.photo} />
          <VoiceBubble m={m} />
        </Row>
        {showText && (
          <Row style={{ paddingLeft: 52 }}>
            <Bubble style={{ maxWidth: 282, background: C.greenLight }}>
              <T w={500} s={fs.s} lh={fs.lh}>{tx(m.text)}</T>
            </Bubble>
          </Row>
        )}
        <Row style={{ paddingLeft: 52 }}>
          <ActionPill icon="message" text={showText ? l('Hide text', '收起文字') : l('Show as text', '转文字')} to={() => setShowText(!showText)} />
          {showText && <ReadPill text={tx(m.text)} id={m.id} />}
        </Row>
      </>
    );
  }

  if (mine)
    return (
      <Row end center>
        {alert}
        <Bubble out style={{ maxWidth: 282, ...faded }}>
          <T w={500} s={fs.s} lh={fs.lh}>{tx(m.text)}</T>
        </Bubble>
      </Row>
    );
  return (
    <>
      <Row>
        <Avatar src={c.photo} />
        <Bubble style={{ maxWidth: 282 }}>
          <T w={500} s={fs.s} lh={fs.lh}>{tx(m.text)}</T>
        </Bubble>
      </Row>
      <Row style={{ paddingLeft: 52 }}>
        <ReadPill text={tx(m.text)} id={m.id} />
      </Row>
    </>
  );
}

function Chat({ route, s, api }) {
  const l = useL();
  const id = route.id;
  const c = contactById(id);
  const msgs = s.chats[id] || [];
  const draft = s.drafts[id] || '';
  const [listening, setListening] = useState(false);
  const picked = s.replies.findIndex((r) => l(r.en, r.cn) === draft);
  const failed = msgs.some((m) => m.status === 'failed');
  const send = () => {
    const text = draft.trim();
    if (!text) return api.toast(t('Type a message first, or tap a quick reply.', '请先输入文字，或点一条快捷回复。'));
    api.sendText(id, text);
    api.draft(id, '');
  };
  const links = {
    back: api.back,
    home: api.home,
    send,
    speak: () => setListening(true),
    edit: () => api.push({ name: 'replies' }),
    replies: s.replies.map((r, i) => () => api.draft(id, picked === i ? '' : l(r.en, r.cn))),
  };
  return (
    <ChatBase
      title={name(c)}
      list={msgs.map((m) => <MsgView key={m.id} m={m} c={c} size={s.textSize} />)}
      input="quick"
      links={links}
      inputProps={{
        field: { value: draft, onChange: (v) => api.draft(id, v), onEnter: send },
        replies: s.replies,
        picked: picked >= 0 ? picked : null,
      }}
    >
      {failed && <ErrorPanel retry={() => api.retry(id)} />}
      {listening && (
        <ListenSheet
          title={['Listening…', '正在听…']}
          result={SPEAK_SAMPLE}
          useLabel={['Use text', '用这句']}
          onCancel={() => setListening(false)}
          onUse={() => {
            api.draft(id, (draft ? `${draft} ` : '') + l(SPEAK_SAMPLE.en, SPEAK_SAMPLE.cn));
            setListening(false);
          }}
        />
      )}
    </ChatBase>
  );
}

/* ======================= Lite: voice, calls ======================= */

function Recorder({ route, api }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSec((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const c = contactById(route.id);
  return <RecorderSheet name={name(c)} time={clock(sec)} cancel={api.back} send={() => api.sendVoice(route.id, sec)} />;
}

function CallConfirmRoute({ route, api }) {
  return <CallConfirm contact={contactById(route.id)} call={() => api.replace({ name: 'call', id: route.id })} cancel={api.back} />;
}

function InCall({ route, api }) {
  const l = useL();
  const c = contactById(route.id);
  const [up, setUp] = useState(!!route.answered);
  const [sec, setSec] = useState(0);
  const [mute, setMute] = useState(false);
  const [cam, setCam] = useState(true);
  useEffect(() => {
    if (up) return undefined;
    const id = setTimeout(() => setUp(true), 2200);
    return () => clearTimeout(id);
  }, [up]);
  useEffect(() => {
    if (!up) return undefined;
    const id = setInterval(() => setSec((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [up]);
  const end = () => {
    api.back();
    api.toast(up ? t(`Call ended · ${clock(sec)}`, `通话结束 · ${clock(sec)}`) : t('Call cancelled', '已取消通话'));
  };
  return (
    <Screen style={{ background: '#111' }}>
      <img
        src={c.photo}
        alt=""
        draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: up ? 'none' : 'blur(14px) brightness(0.6)', transition: 'filter .6s' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7))' }} />
      <Abs x={0} y={70} w={393} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <T w={700} s={32} lh={38} c={C.white} nowrap>{l(c.name, c.cn)}</T>
        <T w={500} s={20} lh={24} c={C.white} nowrap>
          {up ? `${l('Video call', '视频通话')} · ${clock(sec)}` : l('Calling…', '正在呼叫…')}
        </T>
      </Abs>
      {up && (
        <Abs x={263} y={160} w={110} h={160} style={{ borderRadius: 16, background: '#3a3a3a', boxShadow: stroke(2, 'rgba(255,255,255,0.5)'), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name={cam ? 'users' : 'video'} size={34} color="#cfcfcf" />
          <T w={500} s={15} lh={18} c="#cfcfcf" nowrap>{cam ? l('You', '你') : l('Camera off', '摄像头已关')}</T>
        </Abs>
      )}
      <Abs x={0} y={650} w={393} style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        <RoundBtn icon="mic" label={mute ? ['Unmute', '取消静音'] : ['Mute', '静音']} on={mute} to={() => setMute(!mute)} />
        <RoundBtn icon="video" label={cam ? ['Camera off', '关摄像头'] : ['Camera on', '开摄像头']} on={!cam} to={() => setCam(!cam)} />
        <RoundBtn icon="x" label={['End call', '挂断']} color="#e5484d" to={end} g="call-end" />
      </Abs>
    </Screen>
  );
}

function Incoming({ route, api }) {
  const l = useL();
  const c = contactById(route.id);
  return (
    <Screen style={{ background: 'linear-gradient(#1f3d2c, #0b1a12)' }}>
      <Abs x={0} y={150} w={393} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div className="cm-ring" style={{ borderRadius: 100 }}>
          <Photo src={c.photo} size={180} />
        </div>
        <T w={700} s={34} lh={41} c={C.white} nowrap>{l(c.name, c.cn)}</T>
        <T w={500} s={22} lh={27} c="#cfe9d9" nowrap>{l('is video calling you…', '邀请你视频通话…')}</T>
      </Abs>
      <Abs x={0} y={640} w={393} style={{ display: 'flex', justifyContent: 'center', gap: 70 }}>
        <RoundBtn
          icon="x"
          label={['Decline', '拒绝']}
          color="#e5484d"
          size={88}
          to={() => {
            api.back();
            api.toast(t('Call declined', '已拒绝通话'));
          }}
        />
        <RoundBtn icon="video" label={['Answer', '接听']} color={C.green} size={88} g="incoming-answer" to={() => api.replace({ name: 'call', id: route.id, answered: true })} />
      </Abs>
    </Screen>
  );
}

/* ======================= Lite: Help, Ask family ======================= */

function Help({ api }) {
  const [say, setSay] = useState(false);
  return (
    <>
      <HelpSheet topic={(id) => api.startGuide(id)} say={() => setSay(true)} ask={() => api.replace({ name: 'ask' })} close={api.back} selected={-1} />
      {say && (
        <ListenSheet
          title={['Listening…', '正在听…']}
          result={SAY_SAMPLE.text}
          useLabel={['Show me', '教我']}
          onCancel={() => setSay(false)}
          onUse={() => api.startGuide(SAY_SAMPLE.guide)}
        />
      )}
    </>
  );
}

function Ask({ under, s, api }) {
  const shot = (
    <NavCtx.Provider value={{ go: () => {}, interactive: false }}>
      <RouteView route={under} s={s} api={api} />
    </NavCtx.Provider>
  );
  return <AskSheet shot={shot} send={() => api.sendHelp(under)} cancel={() => api.replace({ name: 'help' })} />;
}

/* ======================= Lite: Settings ======================= */

function SetRow({ icon, title, sub, to, g }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div
      {...hot}
      data-guide={g}
      style={{ minHeight: 88, boxSizing: 'border-box', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14, background: C.white, borderRadius: 16 }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 26, background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={28} color={C.greenIcon} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <T w={600} s={21} lh={25}>{l(...title)}</T>
        {sub && <T s={16} lh={20} c={C.sub}>{l(...sub)}</T>}
      </div>
      <Icon name="chevron-right" size={26} color="#9a9a9a" />
    </div>
  );
}

function LiteSettings({ s, api }) {
  const l = useL();
  return (
    <Screen>
      <StatusBar />
      <NavBar title={['Settings', '设置']} back={api.back} home={api.home} />
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <T w={700} s={24} lh={29} nowrap>{l('Settings', '设置')}</T>
        <SetRow
          icon="message"
          title={['Quick replies', '快捷回复']}
          sub={[`${s.replies.length} replies, shown in every chat`, `${s.replies.length}条，显示在每个聊天中`]}
          to={() => api.push({ name: 'replies' })}
          g="set-replies"
        />
        <SetRow
          icon="text-size"
          title={['Text size', '字体大小']}
          sub={s.textSize === 'xlarge' ? ['Extra large', '特大'] : ['Large', '大']}
          to={() => api.push({ name: 'textSize' })}
          g="set-textsize"
        />
        <SetRow
          icon="retry"
          title={['Switch back to standard WeChat', '切换回普通微信']}
          sub={['Smaller text and all WeChat features', '字更小，包含微信全部功能']}
          to={() => api.push({ name: 'switchBack' })}
          g="set-switch"
        />
        <T s={16} lh={21} c={C.sub} style={{ marginTop: 6 }}>
          {l('A family member can also change these settings for you.', '家人也可以帮你修改这些设置。')}
        </T>
      </div>
    </Screen>
  );
}

function SizeOption({ label, sample, on, to, g }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div
      {...hot}
      data-guide={g}
      style={{
        height: 96,
        boxSizing: 'border-box',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: C.white,
        borderRadius: 16,
        boxShadow: on ? stroke(3, C.green) : stroke(1.5, C.neutral),
      }}
    >
      <T w={700} s={sample} lh={sample + 6} nowrap style={{ width: 56 }}>Aa</T>
      <T w={600} s={22} lh={27} nowrap style={{ flex: 1 }}>{l(...label)}</T>
      <div style={{ width: 34, height: 34, borderRadius: 17, background: on ? C.green : C.white, boxShadow: on ? undefined : stroke(2, C.border), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {on && <Icon name="check" size={22} color={C.white} />}
      </div>
    </div>
  );
}

function TextSize({ s, api }) {
  const l = useL();
  const big = s.textSize === 'xlarge';
  return (
    <Screen>
      <StatusBar />
      <NavBar title={['Text size', '字体大小']} back={api.back} home={api.home} />
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <T s={17} lh={22} c={C.sub}>{l('Preview', '预览')}</T>
        <div style={{ background: C.white, borderRadius: 16, padding: 16, display: 'flex', gap: 8 }}>
          <Avatar />
          <Bubble style={{ background: C.field, maxWidth: 270 }}>
            <T w={500} s={big ? 25 : 20} lh={big ? 31 : 24}>{l('Mum, are you coming for dinner on Sunday?', '妈，星期天你来吃晚饭吗？')}</T>
          </Bubble>
        </div>
        <SizeOption label={['Large', '大']} sample={22} on={!big} to={() => api.setTextSize('large')} g="size-large" />
        <SizeOption label={['Extra large', '特大']} sample={30} on={big} to={() => api.setTextSize('xlarge')} g="size-xlarge" />
        <T s={16} lh={21} c={C.sub}>{l('This changes the size of messages in every chat.', '这会改变所有聊天中消息的字体大小。')}</T>
        <Btn kind="primary" icon="check" label="Done" cn="完成" w={361} to={api.back} />
      </div>
    </Screen>
  );
}

function SwitchBack({ api }) {
  const l = useL();
  return (
    <>
      <Dim op={0.45} to={api.back} />
      <Sheet y={448} pad="22px 24px 34px 24px" gap={14}>
        <T w={700} s={24} lh={29}>{l('Switch back to standard WeChat?', '切换回普通微信？')}</T>
        <T s={18} lh={24} c={C.sub}>
          {l('Text and buttons will be smaller. Your chats stay the same. You can turn Lite mode on again in Me → Settings.', '字和按钮会变小，聊天记录不变。可以在“我 → 设置”里重新打开简易模式。')}
        </T>
        <Btn kind="primary" icon="check" label="Stay in Lite mode" cn="继续用简易模式" w={345} to={api.back} />
        <Btn kind="neutral" icon="retry" label="Switch back" cn="切换回去" w={345} to={() => api.setMode('standard')} />
      </Sheet>
    </>
  );
}

/* ---------- quick reply editor ---------- */

function ReplyInputSheet({ title, initial, onSave, onCancel }) {
  const l = useL();
  const [v, setV] = useState(initial);
  const ok = v.trim().length > 0;
  return (
    <>
      <Dim op={0.45} to={onCancel} />
      <Sheet y={452} pad="22px 24px 34px 24px" gap={14}>
        <T w={700} s={24} lh={29} nowrap>{l(...title)}</T>
        <input
          autoFocus
          className="cm-input"
          value={v}
          maxLength={30}
          placeholder={l('e.g. I am on my way', '例如：我在路上了')}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ok && onSave(v.trim())}
          onClick={(e) => e.stopPropagation()}
          style={{
            height: 60,
            boxSizing: 'border-box',
            padding: '0 16px',
            border: 'none',
            outline: 'none',
            borderRadius: 12,
            background: C.field,
            boxShadow: stroke(2, C.green),
            fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 21,
            color: C.text,
          }}
        />
        <T s={16} lh={20} c={C.sub} nowrap>{l(`Short replies work best · ${v.length}/30`, `回复越短越好 · ${v.length}/30`)}</T>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn kind="neutral" icon="x" label="Cancel" cn="取消" w={166} to={onCancel} />
          <Btn kind="primary" icon="check" label="Save" cn="保存" w={167} to={ok ? () => onSave(v.trim()) : undefined} style={ok ? undefined : { opacity: 0.4 }} />
        </div>
      </Sheet>
    </>
  );
}

function Replies({ s, api }) {
  const l = useL();
  const tx = useText();
  const [sheet, setSheet] = useState(null); // { kind: 'edit' | 'add' | 'del', i }
  const list = s.replies;
  const swap = (i, j) => {
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    api.setReplies(next);
  };
  const close = () => setSheet(null);
  return (
    <ReplyEditor
      replies={list}
      max={MAX_REPLIES}
      on={{
        back: api.back,
        home: api.home,
        up: (i) => swap(i, i - 1),
        down: (i) => swap(i, i + 1),
        edit: (i) => setSheet({ kind: 'edit', i }),
        del: (i) => setSheet({ kind: 'del', i }),
        add: () => setSheet({ kind: 'add' }),
      }}
    >
      {sheet && sheet.kind !== 'del' && (
        <ReplyInputSheet
          title={sheet.kind === 'add' ? ['New quick reply', '新的快捷回复'] : ['Edit reply', '修改回复']}
          initial={sheet.kind === 'add' ? '' : tx(list[sheet.i])}
          onCancel={close}
          onSave={(text) => {
            const r = { en: text, cn: text };
            api.setReplies(sheet.kind === 'add' ? [...list, r] : list.map((x, i) => (i === sheet.i ? r : x)));
            api.banner(sheet.kind === 'add' ? t('Reply added', '已添加回复') : t('Reply saved', '已保存回复'));
            close();
          }}
        />
      )}
      {sheet && sheet.kind === 'del' && (
        <>
          <Dim op={0.45} to={close} />
          <Sheet y={540} pad="22px 24px 34px 24px" gap={14}>
            <T w={700} s={24} lh={29}>{l(`Delete “${tx(list[sheet.i])}”?`, `删除“${tx(list[sheet.i])}”？`)}</T>
            <T s={18} lh={22} c={C.sub} nowrap>{l('It will be removed from every chat.', '它会从所有聊天中移除。')}</T>
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn kind="neutral" icon="x" label="Cancel" cn="取消" w={166} to={close} />
              <Btn
                kind="primary"
                icon="trash"
                label="Delete"
                cn="删除"
                w={167}
                style={{ background: '#d92d20' }}
                to={() => {
                  api.setReplies(list.filter((_, i) => i !== sheet.i));
                  api.banner(t('Reply deleted', '已删除回复'));
                  close();
                }}
              />
            </div>
          </Sheet>
        </>
      )}
    </ReplyEditor>
  );
}

/* ======================= Standard WeChat ======================= */

function useWx(api) {
  const other = () => api.toast(OUT_OF_SCOPE);
  const tab = (name) => () => api.setStack([{ name }]);
  return { other, tabs: { chats: tab('wxChats'), contacts: tab('wxContacts'), discover: tab('wxDiscover'), me: tab('wxMe') } };
}

function WxSettingsRoute({ api, top }) {
  const { other } = useWx(api);
  return <SettingsBase on={top.name === 'wxConfirm'} links={{ back: api.back, toggle: () => api.push({ name: 'wxConfirm' }), other }} />;
}

/* ======================= router ======================= */

export function RouteView({ route, s, api, under, top = route }) {
  const p = { route, s, api, under, top };
  const wx = useWx(api);
  switch (route.name) {
    case 'home':
      return <Home {...p} />;
    case 'picker':
      return <Picker {...p} />;
    case 'contact':
      return <Contact {...p} />;
    case 'chat':
      return <Chat {...p} />;
    case 'record':
      return <Recorder {...p} />;
    case 'callConfirm':
      return <CallConfirmRoute {...p} />;
    case 'call':
      return <InCall {...p} />;
    case 'incoming':
      return <Incoming {...p} />;
    case 'help':
      return <Help {...p} />;
    case 'ask':
      return <Ask {...p} />;
    case 'settings':
      return <LiteSettings {...p} />;
    case 'textSize':
      return <TextSize {...p} />;
    case 'switchBack':
      return <SwitchBack {...p} />;
    case 'replies':
      return <Replies {...p} />;
    case 'wxChats':
      return <WxChats {...wx} />;
    case 'wxContacts':
      return <WxContacts {...wx} />;
    case 'wxDiscover':
      return <WxDiscover {...wx} />;
    case 'wxMe':
      return <WxMe {...wx} settings={() => api.push({ name: 'wxSettings' })} />;
    case 'wxSettings':
      return <WxSettingsRoute {...p} />;
    case 'wxConfirm':
      return <LiteConfirmSheet yes={() => api.setMode('lite')} no={api.back} />;
    default:
      return <Home {...p} />;
  }
}

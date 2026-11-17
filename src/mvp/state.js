// State and actions for the Full MVP: one working phone with real chats, settings and guides.
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { QUICK_REPLIES, contactById } from '../screens/bases.jsx';
import { GUIDES } from './guides.js';
import { stopSpeaking } from './speech.js';

const KEY = 'mvp-v1';
const t = (en, cn) => ({ en, cn });
let n = 0;
const nid = () => `m${Date.now().toString(36)}${(n++).toString(36)}`;

/* ---------------- seed data ---------------- */
const date = (id, en, cn) => ({ id, kind: 'date', text: t(en, cn) });
const them = (id, en, cn) => ({ id, from: 'them', kind: 'text', text: t(en, cn) });
const me = (id, en, cn) => ({ id, from: 'me', kind: 'text', text: t(en, cn), status: 'sent' });

export const SEED_CHATS = {
  daughter: [
    date('d0', 'Today 10:30', '今天 10:30'),
    them('d1', 'Mum, are you coming for dinner on Sunday?', '妈，星期天你来吃晚饭吗？'),
    me('d2', 'Yes! I will bring soup.', '好！我会带汤过来。'),
    { id: 'd3', from: 'them', kind: 'voice', dur: 12, text: t('Leo wants to show you his drawing on Sunday.', '星期天乐乐想给你看他画的画。') },
  ],
  son: [
    date('s0', 'Yesterday 19:05', '昨天 19:05'),
    { id: 's1', from: 'them', kind: 'voice', dur: 8, text: t('Mum, I will drive you to the clinic on Friday at 9.', '妈，星期五早上9点我开车送你去诊所。') },
    me('s2', 'Thank you, son.', '谢谢儿子。'),
  ],
  grandson: [
    date('g0', 'Monday 16:20', '星期一 16:20'),
    them('g1', 'Grandma! I got full marks in my spelling test!', '奶奶！我听写考了满分！'),
    me('g2', 'Well done! I am so proud of you.', '真棒！奶奶为你骄傲。'),
  ],
  sister: [date('i0', 'Today 08:15', '今天 08:15'), them('i1', 'Are you coming to the market tomorrow morning?', '明天早上你去菜市场吗？')],
  husband: [date('h0', 'Today 09:40', '今天 09:40'), them('h1', 'I am at the park with Lao Wang. Home by 5.', '我和老王在公园，5点前回家。')],
  family: [
    date('f0', 'Today 10:42', '今天 10:42'),
    them('f1', 'Leo: Look at my new drawing!', '乐乐：看我的新画！'),
    them('f2', 'Anna: So beautiful!', '安娜：好漂亮！'),
  ],
};

const REPLIES = {
  daughter: [t('Great, see you then!', '太好了，到时见！'), t('Thanks Mum! Love you.', '谢谢妈！爱你。')],
  son: [t('Got it, Mum. I will call you tonight.', '知道了，妈。我今晚打给你。'), t('OK Mum, take care.', '好的妈，注意身体。')],
  grandson: [t('Love you Grandma!', '爱你奶奶！'), t('Can we go to the park on Sunday?', '星期天我们可以去公园吗？')],
  sister: [t('OK! See you at 8.', '好！8点见。'), t('Haha, yes!', '哈哈，对！')],
  husband: [t('OK, I will buy some fruit on the way.', '好，我顺路买点水果。'), t('Coming home soon.', '马上回家。')],
  family: [t('Anna: Lovely!', '安娜：真好！'), t('David: Thanks Mum!', '大卫：谢谢妈！')],
};
const HELP_REPLY = t('I can see your screen, Mum. I will call you in 5 minutes.', '妈，我看到你的屏幕了，5分钟后打给你。');

// "Receive a message" demo control picks one of these.
const INCOMING = [
  ['son', t('Mum, did you take your medicine today?', '妈，今天吃药了吗？')],
  ['grandson', t('Grandma, I miss you!', '奶奶，我想你了！')],
  ['sister', t('The market has fresh fish today.', '今天菜市场有新鲜的鱼。')],
  ['daughter', t('Mum, can you send me your soup recipe?', '妈，能把你的汤谱发给我吗？')],
  ['family', t('Leo: Grandma, look at my drawing!', '乐乐：奶奶，看我的画！')],
];

export const SPEAK_SAMPLE = t('I will be there at six o’clock.', '我六点钟到。');
export const MAX_REPLIES = 6;

/* ---------------- reducer ---------------- */
const rootOf = (mode) => (mode === 'lite' ? [{ name: 'home' }] : [{ name: 'wxChats' }]);

function fresh() {
  return {
    mode: 'standard',
    stack: rootOf('standard'),
    chats: SEED_CHATS,
    drafts: {},
    replies: QUICK_REPLIES,
    textSize: 'large',
    offline: false,
    guide: null,
    banner: null,
    toast: null,
  };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.chats) return { ...fresh(), ...saved, stack: rootOf(saved.mode) };
  } catch {
    /* ignore */
  }
  return fresh();
}

const mapChat = (s, id, f) => ({ ...s, chats: { ...s.chats, [id]: f(s.chats[id] || []) } });

function reducer(s, a) {
  switch (a.type) {
    case 'push':
      return { ...s, stack: [...s.stack, a.route] };
    case 'replace':
      return { ...s, stack: [...s.stack.slice(0, -1), a.route] };
    case 'back':
      return s.stack.length > 1 ? { ...s, stack: s.stack.slice(0, -a.n || -1) } : s;
    case 'setStack':
      return { ...s, stack: a.stack };
    case 'home':
      return { ...s, stack: rootOf(s.mode) };
    case 'mode':
      return { ...s, mode: a.mode, stack: rootOf(a.mode) };
    case 'draft':
      return { ...s, drafts: { ...s.drafts, [a.id]: a.text } };
    case 'add':
      return mapChat(s, a.id, (list) => [...list, a.msg]);
    case 'resent':
      return mapChat(s, a.id, (list) => list.map((m) => (m.status === 'failed' ? { ...m, status: 'sent' } : m)));
    case 'replies':
      return { ...s, replies: a.replies };
    case 'textSize':
      return { ...s, textSize: a.size };
    case 'offline':
      return { ...s, offline: a.on };
    case 'guide':
      return { ...s, guide: a.guide };
    case 'banner':
      return { ...s, banner: a.banner };
    case 'toast':
      return { ...s, toast: a.toast };
    case 'reset':
      return fresh();
    default:
      return s;
  }
}

/* ---------------- hook ---------------- */
export function useMvp() {
  const [s, dispatch] = useReducer(reducer, undefined, load);
  const ref = useRef(s);
  ref.current = s;
  const timers = useRef(new Set());

  // Persist the parts worth keeping between visits.
  useEffect(() => {
    const { mode, chats, drafts, replies, textSize, offline } = s;
    try {
      localStorage.setItem(KEY, JSON.stringify({ mode, chats, drafts, replies, textSize, offline }));
    } catch {
      /* storage unavailable */
    }
  }, [s]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = useCallback((ms, f) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      f();
    }, ms);
    timers.current.add(id);
  }, []);

  const api = useMemo(() => {
    const d = dispatch;
    const top = () => ref.current.stack[ref.current.stack.length - 1];
    const a = {
      push: (route) => d({ type: 'push', route }),
      replace: (route) => d({ type: 'replace', route }),
      back: (n = 1) => d({ type: 'back', n }),
      home: () => d({ type: 'home' }),
      setStack: (stack) => d({ type: 'setStack', stack }),
      top,
      draft: (id, text) => d({ type: 'draft', id, text }),
      banner: (title, extra = {}) => d({ type: 'banner', banner: { title, key: nid(), ...extra } }),
      error: (title) => d({ type: 'banner', banner: { title, type: 'error', key: nid() } }),
      toast: (text) => d({ type: 'toast', toast: { text, key: nid() } }),
      clearBanner: () => d({ type: 'banner', banner: null }),
      clearToast: () => d({ type: 'toast', toast: null }),

      setMode: (mode) => {
        d({ type: 'mode', mode });
        if (mode === 'lite') a.banner(t('Lite mode is on', '已打开简易模式'));
        else a.toast(t('Back to standard WeChat. Turn Lite mode on again in Me → Settings.', '已切换回普通微信。可在“我 → 设置”里重新打开简易模式。'));
      },
      setTextSize: (size) => {
        d({ type: 'textSize', size });
        a.banner(size === 'xlarge' ? t('Text size: Extra large', '字体：特大') : t('Text size: Large', '字体：大'));
      },
      setOffline: (on) => d({ type: 'offline', on }),
      setReplies: (replies) => d({ type: 'replies', replies }),

      /** Contact replies a few seconds later (if the phone is online then). */
      autoReply: (id, text, ms = 3500) => {
        later(ms, () => {
          if (ref.current.offline) return;
          const list = REPLIES[id] || REPLIES.daughter;
          const msg = { id: nid(), from: 'them', kind: 'text', text: text || list[Math.floor(Math.random() * list.length)] };
          d({ type: 'add', id, msg });
          const here = top();
          if (!(here.name === 'chat' && here.id === id)) {
            const c = contactById(id);
            a.banner(t(`New message from ${c.name}`, `${c.cn}发来新消息`), { open: id, icon: 'message' });
          }
        });
      },

      /** Add an outgoing message. Fails (and shows the error panel) when "No internet" is on. */
      send: (id, msg, { reply } = {}) => {
        const failed = ref.current.offline;
        d({ type: 'add', id, msg: { id: nid(), from: 'me', status: failed ? 'failed' : 'sent', ...msg } });
        if (failed) return false;
        const c = contactById(id);
        a.banner(t(`Sent to ${c.name}`, `已发送给${c.cn}`));
        a.autoReply(id, reply);
        return true;
      },
      sendText: (id, text) => a.send(id, { kind: 'text', text }),
      sendDraftOr: (id, fallback) => {
        const text = (ref.current.drafts[id] || '').trim();
        a.send(id, { kind: 'text', text: text || fallback });
        d({ type: 'draft', id, text: '' });
      },
      sendVoice: (id, dur) => {
        a.send(id, { kind: 'voice', dur: Math.max(1, dur) });
        // Recorder → chat with that person (frame 06)
        if (top().name === 'record') d({ type: 'replace', route: { name: 'chat', id } });
      },
      retry: (id) => {
        if (ref.current.offline) {
          a.error(t('Still no internet. Turn on Wi-Fi, then try again.', '还是没有网络。请打开 Wi-Fi 后再试。'));
          return;
        }
        d({ type: 'resent', id });
        const c = contactById(id);
        a.banner(t(`Sent to ${c.name}`, `已发送给${c.cn}`));
        a.autoReply(id);
      },
      sendHelp: (shot) => {
        const ok = a.send('son', { kind: 'help', shot }, { reply: HELP_REPLY });
        d({ type: 'back' });
        if (ok) a.banner(t('Help request sent to Son', '求助已发送给儿子'));
        else a.error(t('Not sent – no internet. Open Son’s chat to try again.', '没有网络，未发出。打开儿子的聊天可重试。'));
      },

      /* demo controls */
      receive: () => {
        const [id, text] = INCOMING[Math.floor(Math.random() * INCOMING.length)];
        a.autoReply(id, text, 0);
      },
      incomingCall: (id = 'daughter') => {
        if (ref.current.mode !== 'lite') return a.toast(t('Switch on Lite mode first (Me → Settings).', '请先打开简易模式（我 → 设置）。'));
        if (['call', 'incoming'].includes(top().name)) return;
        d({ type: 'push', route: { name: 'incoming', id } });
      },
      reset: () => {
        timers.current.forEach(clearTimeout);
        timers.current.clear();
        stopSpeaking();
        d({ type: 'reset' });
      },

      /* guides */
      startGuide: (gid, ctx = {}) => {
        const g = GUIDES[gid];
        g.start(a, ctx);
        a.guideAt(gid, 0, ctx);
      },
      guideAt: (gid, step, ctx) => {
        // let navigation land before taking the step's baseline
        const st = GUIDES[gid].steps[step];
        d({ type: 'guide', guide: { id: gid, step, ctx, base: st && st.base ? st.base(ref.current) : 0 } });
      },
      guideNext: () => {
        const g = ref.current.guide;
        if (!g) return;
        const st = GUIDES[g.id].steps[g.step];
        st.act(a, g.ctx);
        a.guideAt(g.id, g.step + 1, g.ctx);
      },
      guideAdvance: () => {
        const g = ref.current.guide;
        if (g) a.guideAt(g.id, g.step + 1, g.ctx);
      },
      endGuide: () => {
        stopSpeaking();
        d({ type: 'guide', guide: null });
      },
    };
    return a;
  }, [later]);

  return [s, api];
}

export { t };

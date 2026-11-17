// Step-by-step guides for the Full MVP (Help menu topics and "Show me how").
// Each step spotlights the element with data-guide = `target` on the real screen.
//   act(api, ctx):  what tapping the spotlight (or Next) does
//   pass:           the spotlight lets taps through to the real controls; the step ends when
//   until(s, base): returns true (base = base(s) taken when the step started)
const t = (en, cn) => ({ en, cn });
// Count only your own messages, so an incoming reply does not finish a step.
const mine = (s, id) => (s.chats[id] || []).filter((m) => m.from === 'me').length;
const chatLen = (id) => (s) => mine(s, id);
const grew = (id) => (s, base) => mine(s, id) > base;

const photo = {
  target: 'tile-daughter',
  text: t('Tap the photo of the person you want to contact.', '点一下你想联系的人的照片。'),
  act: (api) => api.push({ name: 'contact', id: 'daughter' }),
};

export const GUIDES = {
  message: {
    title: t('Guide: Send a message', '正在教：怎么发消息'),
    start: (api) => api.setStack([{ name: 'home' }]),
    steps: [
      { ...photo, text: t('Tap the photo of the person you want to message.', '点一下你想发消息的人的照片。') },
      { target: 'act-message', text: t('Tap “Send Message”.', '点“发消息”。'), act: (api) => api.push({ name: 'chat', id: 'daughter' }) },
      {
        target: 'chat-input',
        pass: true,
        base: chatLen('daughter'),
        until: grew('daughter'),
        text: t('Type your message, or tap a quick reply. Then tap “Send”.', '输入文字，或点一条快捷回复，然后点“发送”。'),
        act: (api) => api.sendDraftOr('daughter', t('Hello!', '你好！')),
      },
    ],
    done: t('You sent a message by yourself.', '你自己发出了消息。'),
  },
  voice: {
    title: t('Guide: Send a voice message', '正在教：怎么发语音'),
    start: (api) => api.setStack([{ name: 'home' }]),
    steps: [
      photo,
      { target: 'act-voice', text: t('Tap “Send Voice Message”. Recording starts.', '点“发语音”，就开始录音。'), act: (api) => api.push({ name: 'record', id: 'daughter' }) },
      {
        target: 'rec-send',
        pass: true,
        base: chatLen('daughter'),
        until: grew('daughter'),
        text: t('Say your message, then tap “Send”.', '说出你想说的话，然后点“发送”。'),
        act: (api) => api.sendVoice('daughter', 4),
      },
    ],
    done: t('You sent a voice message.', '你发出了一条语音。'),
  },
  video: {
    title: t('Guide: Make a video call', '正在教：怎么打视频电话'),
    start: (api) => api.setStack([{ name: 'home' }]),
    steps: [
      photo,
      { target: 'act-video', text: t('Tap “Video Call”.', '点“视频通话”。'), act: (api) => api.push({ name: 'callConfirm', id: 'daughter' }) },
      { target: 'call-yes', text: t('Check the name, then tap “Call”.', '确认名字，然后点“拨打”。'), act: (api) => api.replace({ name: 'call', id: 'daughter' }) },
    ],
    done: t('You started a video call.', '你自己打出了视频电话。'),
  },
  answer: {
    title: t('Guide: Answer a call', '正在教：怎么接电话'),
    start: (api) => api.setStack([{ name: 'home' }, { name: 'incoming', id: 'daughter' }]),
    steps: [
      {
        target: 'incoming-answer',
        text: t('Daughter is calling. Tap the green “Answer” button.', '女儿打来电话。点绿色的“接听”。'),
        act: (api) => api.replace({ name: 'call', id: 'daughter', answered: true }),
      },
    ],
    done: t('You answered a call.', '你自己接了电话。'),
  },
  text: {
    title: t('Guide: Make text bigger', '正在教：怎么放大字体'),
    start: (api) => api.setStack([{ name: 'home' }]),
    steps: [
      { target: 'home-settings', text: t('Tap “Settings” at the top.', '点上方的“设置”。'), act: (api) => api.push({ name: 'settings' }) },
      { target: 'set-textsize', text: t('Tap “Text size”.', '点“字体大小”。'), act: (api) => api.push({ name: 'textSize' }) },
      { target: 'size-xlarge', text: t('Tap “Extra large”.', '点“特大”。'), act: (api) => api.setTextSize('xlarge') },
    ],
    done: t('Messages now use bigger text.', '消息的字已经变大了。'),
  },
  home: {
    title: t('Guide: Go back to Home', '正在教：怎么回到主页'),
    noBar: true, // the Home button sits where the guide bar would be
    start: (api) => api.setStack([{ name: 'home' }, { name: 'contact', id: 'daughter' }]),
    steps: [
      {
        target: 'nav-home',
        text: t('“Home” is always at the top right. Tap it from any screen.', '“主页”一直在右上角，在任何页面都能点。'),
        act: (api) => api.home(),
      },
    ],
    done: t('You know how to go back Home.', '你学会了回到主页。'),
  },
  // "Show me how" on a contact page (frame 09): video call that person.
  showme: {
    title: t('Show me how: Video call', '教我用：视频通话'),
    start: () => {},
    steps: [
      {
        target: 'act-video',
        text: (c) => t(`Tap “Video Call” to see ${c.name} on your screen.`, `点“视频通话”，就能在屏幕上看见${c.cn}。`),
        act: (api, ctx) => api.push({ name: 'callConfirm', id: ctx.id }),
      },
      {
        target: 'call-yes',
        text: (c) => t(`Tap “Call”. ${c.name}’s phone will ring.`, `点“拨打”，${c.cn}的手机就会响。`),
        act: (api, ctx) => api.replace({ name: 'call', id: ctx.id }),
      },
    ],
    done: t('You started a video call.', '你自己打出了视频电话。'),
  },
};

// What "Say what you need" pretends to hear, and which guide it opens.
export const SAY_SAMPLE = { text: t('“How do I make a video call?”', '“怎么打视频电话？”'), guide: 'video' };

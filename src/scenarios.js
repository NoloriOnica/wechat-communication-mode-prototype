// Scenarios shown on the start screen. Each one is an ordered path through the Figma frames.
// Inside the phone, tapping the real buttons follows the same prototype links.
export const SCENARIOS = [
  {
    id: 'video-call',
    title: 'Video call Daughter',
    cn: '给女儿打视频电话',
    persona: 'Mdm Chen wants to see her daughter.',
    summary: 'From Home, tap a family photo, choose Video Call and confirm. The confirmation step prevents accidental calls.',
    steps: ['01', '02', '05'],
    hints: { '01': 'Tap the Daughter photo.', '02': 'Tap “Video Call”.', '05': 'Tap Cancel to go back – no call is made.' },
  },
  {
    id: 'voice-message',
    title: 'Send a voice message',
    cn: '发语音',
    persona: 'Tap once to record – no hold-to-talk.',
    summary: 'Open Daughter, start a voice message, then tap Send. A green “Sent” banner confirms that it worked.',
    steps: ['01', '02', '04', '06'],
    hints: { '01': 'Tap the Daughter photo.', '02': 'Tap “Send Voice Message”.', '04': 'Tap Send when finished.', '06': 'The banner confirms the message was sent.' },
  },
  {
    id: 'chat',
    title: 'Chat and a failed message',
    cn: '聊天与发送失败',
    persona: 'Large text, Read aloud and plain-language errors.',
    summary: 'Read a message in large text, then see what happens when a message cannot be sent and how “Try again” recovers.',
    steps: ['03', '07', '06'],
    hints: { '03': 'Tap Send to send a message.', '07': 'No internet – tap “Try again”.', '06': 'Sent successfully.' },
  },
  {
    id: 'show-me-how',
    title: '“Show me how” on the contact page',
    cn: '教我用',
    persona: 'Optional, step-by-step guidance on demand.',
    summary: 'Tap “Show me how” and the guide highlights the next button to press, with one instruction at a time.',
    steps: ['02', '09', '05'],
    hints: { '02': 'Tap “Show me how” (bottom left).', '09': 'Tap Next or the highlighted Video Call button.', '05': 'The guide led to the call confirmation.' },
  },
  {
    id: 'help-guide',
    title: 'Help menu and guided walkthrough',
    cn: '帮助菜单与教学',
    persona: 'US24 – Mr Ma learns to send a message.',
    summary: 'Help opens a list of everyday tasks. Picking “Send a message” starts a three-step coach-mark guide that ends with praise.',
    steps: ['01', '10', '11', '12', '13', '14'],
    hints: {
      '01': 'Tap Help (bottom right).',
      '10': 'Tap “Send a message”.',
      '11': 'Tap the glowing Daughter photo, or Next.',
      '12': 'Tap the glowing “Send Message”, or Next.',
      '13': 'Tap Send, or Next.',
      '14': 'Done, or practise again.',
    },
  },
  {
    id: 'ask-family',
    title: 'Ask family for help',
    cn: '请家人帮忙',
    persona: 'A screenshot is attached; nothing is sent until confirmed.',
    summary: 'From the Help menu, choose “Ask family”. A request with a screenshot of the current screen is prepared for Son.',
    steps: ['01', '10', '08'],
    hints: { '01': 'Tap Help (bottom right).', '10': 'Tap “Ask family”.', '08': 'Tap “Send request” or Cancel.' },
  },
  {
    id: 'quick-replies',
    title: 'Quick replies',
    cn: '快捷回复',
    persona: 'Feature 12 – answer in two taps.',
    summary: 'Tap a ready-made reply to fill the message box, check it, then tap Send. Replies can be edited and reordered in Settings.',
    steps: ['15', '16', '17', '18'],
    hints: { '15': 'Tap “OK”.', '16': 'Check the reply, then tap Send.', '17': 'Sent. Tap “Edit” to manage replies.', '18': 'Add, edit, delete or reorder replies.' },
  },
];

export const ALL_SCREENS = {
  id: 'all',
  title: 'All screens',
  cn: '全部页面',
  persona: 'Free explore',
  summary: 'Every screen from the Figma file in order. Tap buttons inside the phone to follow the prototype links.',
  steps: Array.from({ length: 18 }, (_, i) => String(i + 1).padStart(2, '0')),
  hints: {},
};

export const findScenario = (id) => (id === 'all' ? ALL_SCREENS : SCENARIOS.find((s) => s.id === id));

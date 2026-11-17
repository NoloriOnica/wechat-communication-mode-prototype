// Standard WeChat screens used before Lite mode is switched on (user flow 1).
// They copy the look of normal WeChat on purpose: small text, dense lists, icon-only tabs.
// Static frames use screen-id links; the Full MVP passes functions through the same props.
import { C, T, Icon, Screen, StatusBar, Dim, Sheet, Btn, useHot, useL, stroke } from '../components/ui.jsx';
import { HomeBase, PHOTOS } from './bases.jsx';

const W = { bg: '#ededed', line: '#e5e5e5', grey: '#888888', light: '#b2b2b2', text: '#191919', red: '#fa5151' };

/* ---------- small pieces ---------- */
function Square({ src, size = 48, color, label }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        overflow: 'hidden',
        flexShrink: 0,
        background: color || '#ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {src ? (
        <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <T w={600} s={size > 40 ? 20 : 16} lh={24} c={C.white} nowrap>{label}</T>
      )}
    </div>
  );
}

function Svg({ size = 26, color = W.text, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const TAB_ICONS = {
  chats: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-3.6-.7L3 20.5l1.4-4.2A7.9 7.9 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />,
  contacts: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7M16 4a4 4 0 0 1 0 8M22 20c0-3-1.8-5.5-4.5-6.5" />
    </>
  ),
  discover: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  me: (
    <>
      <circle cx="12" cy="8" r="4.5" />
      <path d="M3.5 21c0-4.4 3.8-8 8.5-8s8.5 3.6 8.5 8" />
    </>
  ),
};

function Tab({ id, en, cn, on, to }) {
  const hot = useHot(to);
  const l = useL();
  const color = on ? C.green : W.text;
  return (
    <div
      {...hot}
      data-guide={`wx-tab-${id}`}
      style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 6, position: 'relative' }}
    >
      <Svg color={color}>{TAB_ICONS[id]}</Svg>
      <T s={11} lh={14} c={color} nowrap>{l(en, cn)}</T>
      {id === 'chats' && (
        <div style={{ position: 'absolute', left: 44, top: 2, minWidth: 18, height: 18, borderRadius: 9, background: W.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <T w={600} s={11} lh={14} c={C.white} nowrap>3</T>
        </div>
      )}
    </div>
  );
}

/** Bottom tab bar. `active` is the current tab; `tabs` maps tab id → link. */
export function TabBar({ active = 'chats', tabs = {} }) {
  return (
    <div
      style={{
        height: 83,
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        background: '#f7f7f7',
        boxShadow: `inset 0 1px 0 ${W.line}`,
      }}
    >
      <Tab id="chats" en="Chats" cn="微信" on={active === 'chats'} to={active === 'chats' ? undefined : tabs.chats} />
      <Tab id="contacts" en="Contacts" cn="通讯录" on={active === 'contacts'} to={active === 'contacts' ? undefined : tabs.contacts} />
      <Tab id="discover" en="Discover" cn="发现" on={active === 'discover'} to={active === 'discover' ? undefined : tabs.discover} />
      <Tab id="me" en="Me" cn="我" on={active === 'me'} to={active === 'me' ? undefined : tabs.me} />
    </div>
  );
}

function TopBar({ title, back, right, plus }) {
  const hotBack = useHot(back);
  const hotRight = useHot(right);
  const l = useL();
  return (
    <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {back !== undefined && (
        <div {...hotBack} style={{ position: 'absolute', left: 8, top: 4, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Svg size={24}>
            <path d="M15 5l-7 7 7 7" />
          </Svg>
        </div>
      )}
      <T w={600} s={17} lh={22} c={W.text} nowrap>{l(...title)}</T>
      {plus && (
        <div {...hotRight} style={{ position: 'absolute', right: 12, top: 5, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Svg>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8M8 12h8" />
          </Svg>
        </div>
      )}
    </div>
  );
}

function SearchBar({ to }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div style={{ padding: '4px 8px 8px 8px', flexShrink: 0 }}>
      <div {...hot} style={{ height: 36, borderRadius: 6, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <T s={15} lh={18} c={W.light} nowrap>{l('Search', '搜索')}</T>
      </div>
    </div>
  );
}

/** A plain WeChat list cell with an optional square icon. */
function Cell({ en, cn, icon, iconColor, photo, last, to, h = 56 }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div {...hot} style={{ height: h, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 16, background: C.white }}>
      {(icon || photo) && <Square src={photo} size={photo ? 40 : 28} color={iconColor} label={icon} />}
      <div style={{ flex: 1, height: h, display: 'flex', alignItems: 'center', paddingRight: 16, boxShadow: last ? undefined : `inset 0 -0.5px 0 ${W.line}` }}>
        <T s={17} lh={22} c={W.text} nowrap style={{ flex: 1 }}>{l(en, cn)}</T>
        <Svg size={18} color={W.light}>
          <path d="M9 5l7 7-7 7" />
        </Svg>
      </div>
    </div>
  );
}

function Group({ children }) {
  return <div style={{ marginTop: 8, flexShrink: 0 }}>{children}</div>;
}

/* ---------- 19: standard WeChat chat list ---------- */
const CHATS = [
  { photo: PHOTOS.family, name: ['Family Group', '家人群'], msg: ['Grandson: [Photo]', '孙子：[图片]'], time: '10:42' },
  { photo: PHOTOS.daughter, name: ['Daughter', '女儿'], msg: ['Mum, are you coming for dinner on Sunday?', '妈，星期天你来吃晚饭吗？'], time: '10:30' },
  { color: '#07c160', label: '¥', name: ['WeChat Pay', '微信支付'], msg: ['Payment received ¥36.50', '已收款 ¥36.50'], time: '09:15' },
  { photo: PHOTOS.son, name: ['Son', '儿子'], msg: ['[Voice] 0:08', '[语音] 0:08'], time: 'Yesterday', timeCn: '昨天' },
  { color: '#2782d7', label: 'S', name: ['Subscriptions', '订阅号消息'], msg: ['Health tips: 5 ways to sleep better', '健康小贴士：睡得更好的5个方法'], time: 'Yesterday', timeCn: '昨天' },
  { photo: PHOTOS.sister, name: ['Sister', '妹妹'], msg: ['[Sticker]', '[动画表情]'], time: 'Monday', timeCn: '星期一' },
  { photo: PHOTOS.grandson, name: ['Grandson', '孙子'], msg: ['ok', 'ok'], time: 'Sunday', timeCn: '星期日' },
  { photo: PHOTOS.husband, name: ['Husband', '老伴'], msg: ['[Location]', '[位置]'], time: '11/12' },
];

function ChatRow({ c, last, to }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div {...hot} style={{ height: 72, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
      <Square src={c.photo} color={c.color} label={c.label} />
      <div style={{ flex: 1, minWidth: 0, height: 72, boxShadow: last ? undefined : `inset 0 -0.5px 0 ${W.line}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <T s={16} lh={21} c={W.text} nowrap>{l(...c.name)}</T>
          <T s={12} lh={16} c={W.light} nowrap>{l(c.time, c.timeCn || c.time)}</T>
        </div>
        <T s={13} lh={17} c={W.light} nowrap style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{l(...c.msg)}</T>
      </div>
    </div>
  );
}

/** Standard chat list. `other` handles every tap that is outside this prototype (rows, search, +). */
export function WxChats({ tabs = { me: '20' }, other }) {
  return (
    <Screen style={{ background: W.bg }}>
      <StatusBar />
      <TopBar title={['WeChat', '微信']} right={other} plus />
      <SearchBar to={other} />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: C.white }}>
        {CHATS.map((c, i) => (
          <ChatRow key={i} c={c} last={i === CHATS.length - 1} to={other} />
        ))}
      </div>
      <TabBar active="chats" tabs={tabs} />
    </Screen>
  );
}

function S19() {
  return <WxChats />;
}

/* ---------- Full MVP only: Contacts, Discover and Me tabs ---------- */
export function WxContacts({ tabs, other }) {
  const l = useL();
  const people = [
    ['Daughter', '女儿', PHOTOS.daughter],
    ['Family Group', '家人群', PHOTOS.family],
    ['Grandson', '孙子', PHOTOS.grandson],
    ['Husband', '老伴', PHOTOS.husband],
    ['Sister', '妹妹', PHOTOS.sister],
    ['Son', '儿子', PHOTOS.son],
  ];
  return (
    <Screen style={{ background: W.bg }}>
      <StatusBar />
      <TopBar title={['Contacts', '通讯录']} right={other} plus />
      <SearchBar to={other} />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Cell en="New Friends" cn="新的朋友" icon="+" iconColor="#fa9d3b" to={other} />
        <Cell en="Group Chats" cn="群聊" icon="#" iconColor="#07c160" to={other} />
        <Cell en="Tags" cn="标签" icon="T" iconColor="#2782d7" last to={other} />
        <div style={{ padding: '10px 16px 4px', background: W.bg }}>
          <T s={13} lh={16} c={W.grey}>{l('Family', '家人')}</T>
        </div>
        {people.map(([en, cn, photo], i) => (
          <Cell key={en} en={en} cn={cn} photo={photo} h={60} last={i === people.length - 1} to={other} />
        ))}
      </div>
      <TabBar active="contacts" tabs={tabs} />
    </Screen>
  );
}

export function WxDiscover({ tabs, other }) {
  return (
    <Screen style={{ background: W.bg }}>
      <StatusBar />
      <TopBar title={['Discover', '发现']} />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Group>
          <Cell en="Moments" cn="朋友圈" icon="◎" iconColor="#fa9d3b" last to={other} />
        </Group>
        <Group>
          <Cell en="Channels" cn="视频号" icon="▶" iconColor="#fa9d3b" last to={other} />
        </Group>
        <Group>
          <Cell en="Scan" cn="扫一扫" icon="⌗" iconColor="#2782d7" to={other} />
          <Cell en="Shake" cn="摇一摇" icon="≈" iconColor="#2782d7" last to={other} />
        </Group>
        <Group>
          <Cell en="Top Stories" cn="看一看" icon="★" iconColor="#fa5151" to={other} />
          <Cell en="Search" cn="搜一搜" icon="⌕" iconColor="#fa5151" last to={other} />
        </Group>
        <Group>
          <Cell en="Mini Programs" cn="小程序" icon="∞" iconColor="#7d5bd6" last to={other} />
        </Group>
      </div>
      <TabBar active="discover" tabs={tabs} />
    </Screen>
  );
}

export function WxMe({ tabs, settings, other }) {
  const l = useL();
  const profile = useHot(other);
  return (
    <Screen style={{ background: W.bg }}>
      <StatusBar />
      <div {...profile} style={{ height: 140, flexShrink: 0, background: C.white, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px' }}>
        <Square color="#c9a27e" label="陈" size={64} />
        <div style={{ flex: 1 }}>
          <T w={600} s={20} lh={26} c={W.text} nowrap>{l('Mdm Chen', '陈阿姨')}</T>
          <T s={14} lh={20} c={W.grey} nowrap>{l('WeChat ID: chen_meiling', '微信号：chen_meiling')}</T>
        </div>
        <Svg size={18} color={W.light}>
          <path d="M9 5l7 7-7 7" />
        </Svg>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Group>
          <Cell en="Services" cn="服务" icon="✓" iconColor="#07c160" last to={other} />
        </Group>
        <Group>
          <Cell en="Favorites" cn="收藏" icon="◆" iconColor="#fa5151" to={other} />
          <Cell en="Moments" cn="朋友圈" icon="◎" iconColor="#2782d7" to={other} />
          <Cell en="Sticker Gallery" cn="表情" icon="☺" iconColor="#fa9d3b" last to={other} />
        </Group>
        <Group>
          <div data-guide="wx-settings">
            <Cell en="Settings" cn="设置" icon="⚙" iconColor="#2782d7" last to={settings} />
          </div>
        </Group>
      </div>
      <TabBar active="me" tabs={tabs} />
    </Screen>
  );
}

/* ---------- 20–21: Settings with the Lite mode toggle ---------- */
function Toggle({ on }) {
  return (
    <div style={{ width: 51, height: 31, borderRadius: 16, background: on ? C.green : '#e9e9ea', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 27, height: 27, borderRadius: 14, background: C.white, boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
    </div>
  );
}

function Row({ en, cn, last, right, to, tall, g, children }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div
      {...hot}
      data-guide={g}
      style={{ minHeight: tall ? 64 : 56, display: 'flex', alignItems: 'center', padding: '0 16px', background: C.white, boxShadow: last ? undefined : `inset 0 -0.5px 0 ${W.line}` }}
    >
      <div style={{ flex: 1, padding: tall ? '10px 0' : 0 }}>
        <T s={17} lh={22} c={W.text} nowrap>{l(en, cn)}</T>
        {children}
      </div>
      {right || (
        <Svg size={18} color={W.light}>
          <path d="M9 5l7 7-7 7" />
        </Svg>
      )}
    </div>
  );
}

function Centered({ en, cn, to }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div {...hot} style={{ height: 56, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <T s={17} lh={22} c={W.text} nowrap>{l(en, cn)}</T>
    </div>
  );
}

/** Standard Settings page. links: { back, toggle, other } */
export function SettingsBase({ on, links = {}, children }) {
  const l = useL();
  const o = links.other;
  return (
    <Screen style={{ background: W.bg }}>
      <StatusBar />
      <TopBar title={['Settings', '设置']} back={links.back ?? null} />
      <Group>
        <Row en="Account Security" cn="账号与安全" last to={o} />
      </Group>
      <Group>
        <Row en="Lite mode" cn="简易模式" last tall to={links.toggle} g="wx-lite-toggle" right={<Toggle on={on} />}>
          <T s={13} lh={17} c={W.grey} style={{ marginTop: 3, width: 280 }}>
            {l(
              'Larger text and buttons, family photos on the first screen, and help on every page.',
              '字更大、按钮更大，家人照片放在首页，每一页都有帮助。',
            )}
          </T>
        </Row>
      </Group>
      <Group>
        <Row en="Message Notifications" cn="消息通知" to={o} />
        <Row en="Chats" cn="聊天" to={o} />
        <Row en="General" cn="通用" to={o} />
        <Row en="Privacy" cn="隐私" last to={o} />
      </Group>
      <Group>
        <Row en="Help & Feedback" cn="帮助与反馈" to={o} />
        <Row en="About WeChat" cn="关于微信" last to={o} />
      </Group>
      <Group>
        <Centered en="Switch Account" cn="切换账号" to={o} />
      </Group>
      <Group>
        <Centered en="Log Out" cn="退出" to={o} />
      </Group>
      {children}
    </Screen>
  );
}

function S20() {
  return <SettingsBase links={{ back: '19', toggle: '21' }} />;
}

/** Live preview of the Lite mode home screen inside the confirmation. */
function MiniLite() {
  return (
    <div style={{ width: 98, height: 212, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: stroke(1, C.border), position: 'relative' }}>
      <div style={{ transform: 'scale(0.25)', transformOrigin: '0 0', pointerEvents: 'none' }}>
        <HomeBase />
      </div>
    </div>
  );
}

function Point({ children }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <Icon name="check" size={22} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} />
      <T w={500} s={17} lh={22}>{children}</T>
    </div>
  );
}

/** “Switch to Lite mode?” sheet (21). */
export function LiteConfirmSheet({ yes = '01', no = '20' }) {
  const l = useL();
  return (
    <>
      <Dim op={0.45} to={no} />
      <Sheet y={392} pad="22px 24px 34px 24px" gap={16}>
        <T w={700} s={26} lh={31} nowrap>{l('Switch to Lite mode?', '切换到简易模式？')}</T>
        <div style={{ display: 'flex', gap: 16 }}>
          <MiniLite />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <Point>{l('Bigger text and buttons', '字和按钮都更大')}</Point>
            <Point>{l('Family photos on the first screen', '家人照片在首页')}</Point>
            <Point>{l('Your chats and contacts stay the same', '聊天记录和联系人不变')}</Point>
            <Point>{l('Switch back any time in Settings', '随时可以在设置里切换回来')}</Point>
          </div>
        </div>
        <Btn g="lite-yes" kind="primary" icon="check" label="Switch to Lite mode" cn="切换到简易模式" w={345} to={yes} />
        <Btn kind="neutral" icon="x" label="Not now" cn="暂不切换" w={345} to={no} />
      </Sheet>
    </>
  );
}

function S21() {
  return (
    <SettingsBase on>
      <LiteConfirmSheet />
    </SettingsBase>
  );
}

export const WECHAT_SCREENS = { '19': S19, '20': S20, '21': S21 };

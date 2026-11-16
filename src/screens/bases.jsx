// The three underlying pages (Home, Contact page, Chat). Every numbered Figma frame
// is one of these plus an overlay or a small variation.
import {
  C, T, Icon, Photo, Screen, StatusBar, NavBar, Btn, ActionPill, HelpButton, ShowMeHow, Abs, useHot, stroke,
} from '../components/ui.jsx';
import daughter from '../assets/photos/daughter.png';
import son from '../assets/photos/son.png';
import grandson from '../assets/photos/grandson.png';
import sister from '../assets/photos/sister.png';
import husband from '../assets/photos/husband.png';
import family from '../assets/photos/family.png';

export const PHOTOS = { daughter, son, grandson, sister, husband, family };

export const CONTACTS = [
  { id: 'daughter', name: 'Daughter', cn: '女儿', photo: daughter },
  { id: 'son', name: 'Son', cn: '儿子', photo: son },
  { id: 'grandson', name: 'Grandson', cn: '孙子', photo: grandson },
  { id: 'sister', name: 'Sister', cn: '妹妹', photo: sister },
  { id: 'husband', name: 'Husband', cn: '老伴', photo: husband },
  { id: 'family', name: 'Family Group', cn: '家人群', photo: family },
];

/* ================= Home ================= */

export function ContactTile({ name, cn, photo, to, style }) {
  const hot = useHot(to);
  return (
    <div
      {...hot}
      style={{
        width: 170,
        height: 180,
        boxSizing: 'border-box',
        padding: '12px 8px 10px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        background: C.white,
        borderRadius: 20,
        flexShrink: 0,
        ...style,
      }}
    >
      <Photo src={photo} size={104} />
      <T w={600} s={22} lh={27} nowrap>{name}</T>
      <T f="noto" s={16} lh={19} c={C.subCn} nowrap>{cn}</T>
    </div>
  );
}

function BottomAction({ icon, en, cn, color = C.text, to }) {
  const hot = useHot(to);
  return (
    <div
      {...hot}
      style={{
        width: 90,
        height: 84,
        boxSizing: 'border-box',
        padding: '6px 0 4px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Icon name={icon} size={32} color={color} />
      <T w={600} s={18} lh={22} nowrap>{en}</T>
      <T f="noto" s={13} lh={16} c={C.sub} nowrap>{cn}</T>
    </div>
  );
}

export function HomeBase({ links = {}, children }) {
  const settings = useHot(links.settings);
  return (
    <Screen>
      <StatusBar />
      <div
        style={{
          height: 83,
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: '4px 16px 2px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <T w={500} s={20} lh={24} c={C.sub} nowrap>Good morning,</T>
          <T w={700} s={28} lh={34} nowrap>Mdm Chen</T>
          <T f="noto" s={16} lh={19} c={C.sub} nowrap>早上好，陈阿姨</T>
        </div>
        <div
          {...settings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 49,
            boxSizing: 'border-box',
            padding: '8px 14px 8px 12px',
            background: C.white,
            borderRadius: 24,
          }}
        >
          <Icon name="settings" size={24} />
          <div>
            <T w={600} s={17} lh={21} nowrap>Settings</T>
            <T f="noto" s={12} lh={14} c={C.sub} nowrap style={{ marginTop: -2 }}>设置</T>
          </div>
        </div>
      </div>
      <div style={{ height: 30, flexShrink: 0, boxSizing: 'border-box', padding: '4px 0 6px 20px' }}>
        <T f="noto" s={17} lh={20} c={C.sub} nowrap>Tap a photo to contact  ·  点照片联系家人</T>
      </div>
      <div
        style={{
          height: 564,
          flexShrink: 0,
          padding: '0 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          columnGap: 13,
          rowGap: 12,
        }}
      >
        {CONTACTS.map((c) => (
          <ContactTile key={c.id} {...c} to={links[c.id]} />
        ))}
      </div>
      <div style={{ height: 11, flexShrink: 0 }} />
      <div
        style={{
          height: 121,
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: '10px 8px 26px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          background: C.white,
          boxShadow: stroke(1, C.border),
        }}
      >
        <BottomAction icon="message" en="Messages" cn="消息" to={links.messages} />
        <BottomAction icon="mic" en="Voice" cn="语音" to={links.voice} />
        <BottomAction icon="video" en="Video" cn="视频" color={C.green} to={links.video} />
        <BottomAction icon="help" en="Help" cn="帮助" to={links.help} />
      </div>
      {children}
    </Screen>
  );
}

/* ================= Contact page ================= */

export function ContactBase({ links = {}, children }) {
  return (
    <Screen>
      <StatusBar />
      <NavBar title="Daughter" back={links.back} home={links.home} />
      <div
        style={{
          height: 524,
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: '22px 24px 0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <Photo src={daughter} size={140} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <T w={700} s={30} lh={36} nowrap>Daughter</T>
          <T f="noto" s={18} lh={22} c={C.sub} nowrap>女儿 · Anna</T>
        </div>
        <div style={{ width: 10, height: 6, flexShrink: 0 }} />
        <ContactActions links={links} />
      </div>
      <HelpButton to={links.help} />
      <ShowMeHow to={links.showMe} />
      {children}
    </Screen>
  );
}

export function ContactActions({ links = {}, only }) {
  const items = [
    { k: 'message', el: <Btn key="m" kind="secondary" icon="message" label="Send Message" cn="发消息" w={345} to={links.message} /> },
    { k: 'voice', el: <Btn key="v" kind="secondary" icon="mic" label="Send Voice Message" cn="发语音" w={345} to={links.voice} /> },
    { k: 'video', el: <Btn key="c" kind="primary" icon="video" label="Video Call" cn="视频通话" w={345} to={links.video} /> },
  ];
  return items.filter((i) => !only || i.k === only).map((i) => i.el);
}

/* ================= Chat ================= */

function Avatar() {
  return <Photo src={daughter} size={44} />;
}

function Bubble({ out, w, children, style }) {
  return (
    <div
      style={{
        width: w,
        boxSizing: 'border-box',
        padding: '12px 16px',
        borderRadius: 14,
        background: out ? C.bubble : C.white,
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const Row = ({ end, center, children, style }) => (
  <div
    style={{
      display: 'flex',
      gap: 8,
      justifyContent: end ? 'flex-end' : 'flex-start',
      alignItems: center ? 'center' : 'flex-start',
      flexShrink: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Message building blocks, referenced by key in each screen's message list. */
export const MSG = {
  date: () => (
    <T f="noto" s={15} lh={18} c="#8c8c8c" align="center" nowrap>Today 10:30  ·  今天</T>
  ),
  dinner: () => (
    <>
      <Row>
        <Avatar />
        <Bubble w={282}>
          <T w={500} s={20} lh={24}>Mum, are you coming for dinner on Sunday?</T>
        </Bubble>
      </Row>
      <Row style={{ paddingLeft: 52 }}>
        <ActionPill icon="volume" text="Read aloud  朗读" />
      </Row>
    </>
  ),
  soup: () => (
    <Row end>
      <Bubble out w={282}>
        <T w={500} s={20} lh={24}>Yes! I will bring soup.</T>
      </Bubble>
    </Row>
  ),
  voiceIn: () => (
    <>
      <Row>
        <Avatar />
        <div
          style={{
            width: 218,
            height: 50,
            boxSizing: 'border-box',
            padding: '12px 60px 12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: C.white,
            borderRadius: 14,
          }}
        >
          <Icon name="volume" size={26} />
          <T w={600} s={20} lh={24} nowrap>Voice  0:12</T>
        </div>
      </Row>
      <Row style={{ paddingLeft: 52 }}>
        <ActionPill icon="message" text="Show as text  转文字" />
      </Row>
    </>
  ),
  voiceOut: () => (
    <Row end>
      <div
        style={{
          width: 216,
          height: 48,
          boxSizing: 'border-box',
          padding: '12px 16px 12px 60px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: C.bubble,
          borderRadius: 14,
        }}
      >
        <T w={600} s={20} lh={24} nowrap>Voice  0:12</T>
        <Icon name="check" size={24} color={C.greenDark} />
      </div>
    </Row>
  ),
  sundayFailed: () => (
    <Row end center>
      <Icon name="alert" size={26} color="#dc6803" />
      <Bubble w={221} style={{ background: 'rgba(149,236,105,0.6)' }}>
        <T w={500} s={20} lh={24} nowrap>See you on Sunday!</T>
      </Bubble>
    </Row>
  ),
  sunday: () => (
    <Row end>
      <Bubble out w={221}>
        <T w={500} s={20} lh={24} nowrap>See you on Sunday!</T>
      </Bubble>
    </Row>
  ),
  okSent: () => (
    <Row end center>
      <div
        style={{
          height: 48,
          boxSizing: 'border-box',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: C.bubble,
          borderRadius: 14,
        }}
      >
        <T f="noto" w={500} s={20} lh={24} nowrap>OK  好的</T>
        <Icon name="check" size={22} color={C.greenDark} />
      </div>
    </Row>
  ),
};

function TextField({ value, focused }) {
  return (
    <div
      style={{
        height: focused ? 56 : 52,
        flexShrink: 0,
        boxSizing: 'border-box',
        padding: '14px 0 14px 16px',
        display: 'flex',
        alignItems: focused ? 'center' : 'flex-start',
        background: C.field,
        borderRadius: 12,
        boxShadow: focused ? stroke(2, C.green) : stroke(1, C.border),
      }}
    >
      {value ? (
        <T f="noto" w={500} s={20} lh={24} nowrap style={{ paddingLeft: 2 }}>{value}</T>
      ) : (
        <T f="noto" s={18} lh={22} c="#9a9a9a" nowrap>Type a message…  输入文字</T>
      )}
    </div>
  );
}

export function ChatButtons({ links = {} }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
      <Btn kind="secondary" icon="mic" label="Speak to type" cn="说话打字" w={221} pl={14} pr={10} gap={10} to={links.speak} />
      <Btn kind="primary" icon="send" label="Send" cn="发送" w={130} pl={20} to={links.send} />
    </div>
  );
}

export const QUICK_REPLIES = [
  { en: 'OK', cn: '好的' },
  { en: 'Thank you', cn: '谢谢' },
  { en: "I'm fine", cn: '我很好' },
  { en: 'Call me later', cn: '稍后打给我' },
];

function QuickReply({ en, cn, selected, to }) {
  const hot = useHot(to);
  return (
    <div
      {...hot}
      style={{
        width: 175,
        height: 62,
        boxSizing: 'border-box',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 31,
        background: selected ? C.green : C.white,
        boxShadow: selected ? stroke(3, C.greenDark) : stroke(2, C.green),
      }}
    >
      <T w={600} s={19} lh={23} c={selected ? C.white : C.text} nowrap>{en}</T>
      <T f="noto" s={14} lh={17} c={selected ? C.greenLight : C.sub} nowrap>{cn}</T>
    </div>
  );
}

function QuickReplies({ selected, links }) {
  const edit = useHot(links.edit);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
      {selected ? (
        <div style={{ height: 18 }}>
          <T f="noto" w={500} s={15} lh={18} c={C.greenDark} nowrap>Check your reply, then tap Send  ·  确认后点发送</T>
        </div>
      ) : (
        <div style={{ height: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <T f="noto" w={500} s={16} lh={19} c={C.sub} nowrap>Quick replies  ·  快捷回复</T>
          <div
            {...edit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              boxSizing: 'border-box',
              padding: '8px 14px 8px 12px',
              background: C.chip,
              borderRadius: 22,
            }}
          >
            <Icon name="pencil" size={20} />
            <T f="noto" w={500} s={16} lh={19} nowrap>Edit  编辑</T>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 11, rowGap: 10 }}>
        {QUICK_REPLIES.map((r, i) => (
          <QuickReply key={r.en} {...r} selected={selected && i === 0} to={links.replies?.[i]} />
        ))}
      </div>
    </div>
  );
}

/** Bottom input area. mode: 'plain' | 'quick' | 'selected' */
export function InputArea({ mode = 'plain', links = {} }) {
  return (
    <div
      style={{
        flexShrink: 0,
        boxSizing: 'border-box',
        padding: '12px 16px 28px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: C.white,
      }}
    >
      {mode !== 'plain' && <QuickReplies selected={mode === 'selected'} links={links} />}
      <TextField value={mode === 'selected' ? 'OK  好的' : null} focused={mode === 'selected'} />
      <ChatButtons links={links} />
    </div>
  );
}

export function ChatBase({ title = 'Daughter', messages = [], input = 'plain', links = {}, children }) {
  return (
    <Screen>
      <StatusBar />
      <NavBar title={title} back={links.back} home={links.home} />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: '14px 16px 0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.map((m, i) => (
          <MsgFragment key={i} k={m} />
        ))}
      </div>
      <InputArea mode={input} links={links} />
      {children}
    </Screen>
  );
}

function MsgFragment({ k }) {
  const El = MSG[k];
  return <El />;
}

export { Abs };

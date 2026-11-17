// The three underlying pages (Home, Contact page, Chat). Every numbered Figma frame
// is one of these plus an overlay or a small variation.
import { useEffect, useRef, useState } from 'react';
import {
  C, T, Icon, Photo, Screen, StatusBar, NavBar, Btn, ActionPill, HelpButton, ShowMeHow, Abs, useHot, useL, stroke,
} from '../components/ui.jsx';
import daughter from '../assets/photos/daughter.png';
import son from '../assets/photos/son.png';
import grandson from '../assets/photos/grandson.png';
import sister from '../assets/photos/sister.png';
import husband from '../assets/photos/husband.png';
import family from '../assets/photos/family.png';

export const PHOTOS = { daughter, son, grandson, sister, husband, family };

export const CONTACTS = [
  { id: 'daughter', name: 'Daughter', cn: '女儿', photo: daughter, sub: 'Anna' },
  { id: 'son', name: 'Son', cn: '儿子', photo: son, sub: 'David' },
  { id: 'grandson', name: 'Grandson', cn: '孙子', photo: grandson, sub: 'Leo' },
  { id: 'sister', name: 'Sister', cn: '妹妹', photo: sister, sub: 'Mei' },
  { id: 'husband', name: 'Husband', cn: '老伴', photo: husband, sub: 'Wei' },
  { id: 'family', name: 'Family Group', cn: '家人群', photo: family, sub: '6 members', subCn: '6位成员' },
];
export const contactById = (id) => CONTACTS.find((c) => c.id === id) || CONTACTS[0];

/* ================= Home ================= */

export function ContactTile({ id, name, cn, photo, to, style }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div
      {...hot}
      data-guide={id && `tile-${id}`}
      style={{
        width: 170,
        height: 180,
        boxSizing: 'border-box',
        padding: '12px 8px 10px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: C.white,
        borderRadius: 20,
        flexShrink: 0,
        ...style,
      }}
    >
      <Photo src={photo} size={104} />
      <T w={600} s={22} lh={27} nowrap>{l(name, cn)}</T>
    </div>
  );
}

function BottomAction({ icon, en, cn, color = C.text, to }) {
  const hot = useHot(to);
  const l = useL();
  return (
    <div
      {...hot}
      data-guide={`bottom-${icon}`}
      style={{
        width: 90,
        height: 84,
        boxSizing: 'border-box',
        padding: '6px 0 4px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Icon name={icon} size={32} color={color} />
      <T w={600} s={18} lh={22} nowrap>{l(en, cn)}</T>
    </div>
  );
}

export function HomeBase({ links = {}, children }) {
  const settings = useHot(links.settings);
  const l = useL();
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
          <T w={500} s={20} lh={24} c={C.sub} nowrap>{l('Good morning,', '早上好，')}</T>
          <T w={700} s={28} lh={34} nowrap>{l('Mdm Chen', '陈阿姨')}</T>
        </div>
        <div
          {...settings}
          data-guide="home-settings"
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
          <T w={600} s={17} lh={21} nowrap>{l('Settings', '设置')}</T>
        </div>
      </div>
      <div style={{ height: 30, flexShrink: 0, boxSizing: 'border-box', padding: '4px 0 6px 20px' }}>
        <T s={17} lh={20} c={C.sub} nowrap>{l('Tap a photo to contact', '点照片联系家人')}</T>
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

export function ContactBase({ links = {}, contact = CONTACTS[0], children }) {
  const l = useL();
  const c = contact;
  return (
    <Screen>
      <StatusBar />
      <NavBar title={[c.name, c.cn]} back={links.back} home={links.home} />
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
        <Photo src={c.photo} size={140} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <T w={700} s={30} lh={36} nowrap>{l(c.name, c.cn)}</T>
          <T s={18} lh={22} c={C.sub} nowrap>{l(c.sub, c.subCn || c.sub)}</T>
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
    { k: 'message', el: <Btn key="m" g="act-message" kind="secondary" icon="message" label="Send Message" cn="发消息" w={345} to={links.message} /> },
    { k: 'voice', el: <Btn key="v" g="act-voice" kind="secondary" icon="mic" label="Send Voice Message" cn="发语音" w={345} to={links.voice} /> },
    { k: 'video', el: <Btn key="c" g="act-video" kind="primary" icon="video" label="Video Call" cn="视频通话" w={345} to={links.video} /> },
  ];
  return items.filter((i) => !only || i.k === only).map((i) => i.el);
}

/* ================= Chat ================= */

function Avatar({ src = daughter }) {
  return <Photo src={src} size={44} />;
}

export function Bubble({ out, w, children, style }) {
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

export const Row = ({ end, center, children, style }) => (
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
  date: ({ l }) => (
    <T s={15} lh={18} c="#8c8c8c" align="center" nowrap>{l('Today 10:30', '今天 10:30')}</T>
  ),
  dinner: ({ l }) => (
    <>
      <Row>
        <Avatar />
        <Bubble w={282}>
          <T w={500} s={20} lh={24}>{l('Mum, are you coming for dinner on Sunday?', '妈，星期天你来吃晚饭吗？')}</T>
        </Bubble>
      </Row>
      <Row style={{ paddingLeft: 52 }}>
        <ActionPill icon="volume" text={l('Read aloud', '朗读')} />
      </Row>
    </>
  ),
  soup: ({ l }) => (
    <Row end>
      <Bubble out w={282}>
        <T w={500} s={20} lh={24}>{l('Yes! I will bring soup.', '好！我会带汤过来。')}</T>
      </Bubble>
    </Row>
  ),
  voiceIn: ({ l }) => (
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
          <T w={600} s={20} lh={24} nowrap>{l('Voice', '语音')}  0:12</T>
        </div>
      </Row>
      <Row style={{ paddingLeft: 52 }}>
        <ActionPill icon="message" text={l('Show as text', '转文字')} />
      </Row>
    </>
  ),
  voiceOut: ({ l }) => (
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
        <T w={600} s={20} lh={24} nowrap>{l('Voice', '语音')}  0:12</T>
        <Icon name="check" size={24} color={C.greenDark} />
      </div>
    </Row>
  ),
  sundayFailed: ({ l }) => (
    <Row end center>
      <Icon name="alert" size={26} color="#dc6803" />
      <Bubble w={221} style={{ background: 'rgba(149,236,105,0.6)' }}>
        <T w={500} s={20} lh={24} nowrap>{l('See you on Sunday!', '星期天见！')}</T>
      </Bubble>
    </Row>
  ),
  sunday: ({ l }) => (
    <Row end>
      <Bubble out w={221}>
        <T w={500} s={20} lh={24} nowrap>{l('See you on Sunday!', '星期天见！')}</T>
      </Bubble>
    </Row>
  ),
  okSent: ({ l }) => (
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
        <T w={500} s={20} lh={24} nowrap>{l('OK', '好的')}</T>
        <Icon name="check" size={22} color={C.greenDark} />
      </div>
    </Row>
  ),
};

function TextField({ value, focused, onChange, onEnter }) {
  const l = useL();
  if (onChange) return <LiveField value={value} onChange={onChange} onEnter={onEnter} />;
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
        <T w={500} s={20} lh={24} nowrap style={{ paddingLeft: 2 }}>{value}</T>
      ) : (
        <T s={18} lh={22} c="#9a9a9a" nowrap>{l('Type a message…', '输入文字…')}</T>
      )}
    </div>
  );
}

/** Real text box, styled like the Figma field. Used by the Full MVP. */
function LiveField({ value, onChange, onEnter }) {
  const l = useL();
  const [focus, setFocus] = useState(false);
  const on = focus || !!value;
  return (
    <input
      className="cm-input"
      data-guide="chat-field"
      value={value}
      placeholder={l('Type a message…', '输入文字…')}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onEnter && onEnter()}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onClick={(e) => e.stopPropagation()}
      style={{
        height: on ? 56 : 52,
        width: '100%',
        flexShrink: 0,
        boxSizing: 'border-box',
        padding: '0 16px',
        border: 'none',
        outline: 'none',
        background: C.field,
        borderRadius: 12,
        boxShadow: on ? stroke(2, C.green) : stroke(1, C.border),
        fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 20,
        color: C.text,
      }}
    />
  );
}

export function ChatButtons({ links = {} }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
      <Btn g="chat-speak" kind="secondary" icon="mic" label="Speak to type" cn="说话打字" w={221} pl={14} pr={10} gap={10} to={links.speak} />
      <Btn g="chat-send" kind="primary" icon="send" label="Send" cn="发送" w={130} pl={20} to={links.send} />
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
  const l = useL();
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
      <T w={600} s={19} lh={23} c={selected ? C.white : C.text} nowrap style={{ maxWidth: 151, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {l(en, cn)}
      </T>
    </div>
  );
}

/** `selected`: true = first reply (static frame 16), a number = that reply (Full MVP), false/null = none. */
function QuickReplies({ selected, links, replies = QUICK_REPLIES }) {
  const edit = useHot(links.edit);
  const l = useL();
  const picked = selected === true ? 0 : typeof selected === 'number' ? selected : -1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
      {picked >= 0 ? (
        <div style={{ height: 18 }}>
          <T w={500} s={15} lh={18} c={C.greenDark} nowrap>{l('Check your reply, then tap Send', '确认回复后，点“发送”')}</T>
        </div>
      ) : (
        <div style={{ height: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <T w={500} s={16} lh={19} c={C.sub} nowrap>{l('Quick replies', '快捷回复')}</T>
          <div
            {...edit}
            data-guide="replies-edit"
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
            <T w={500} s={16} lh={19} nowrap>{l('Edit', '编辑')}</T>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 11, rowGap: 10 }}>
        {replies.map((r, i) => (
          <QuickReply key={r.en + i} {...r} selected={i === picked} to={links.replies?.[i]} />
        ))}
      </div>
    </div>
  );
}

/**
 * Bottom input area. mode: 'plain' | 'quick' | 'selected'.
 * Full MVP: `field` = { value, onChange, onEnter } makes the box real; `replies` / `picked` drive quick replies.
 */
export function InputArea({ mode = 'plain', links = {}, field, replies, picked }) {
  const l = useL();
  const sel = picked !== undefined ? picked : mode === 'selected';
  return (
    <div
      data-guide="chat-input"
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
      {mode !== 'plain' && <QuickReplies selected={sel} links={links} replies={replies} />}
      {field ? (
        <TextField {...field} />
      ) : (
        <TextField value={mode === 'selected' ? l('OK', '好的') : null} focused={mode === 'selected'} />
      )}
      <ChatButtons links={links} />
    </div>
  );
}

/** Chat page. `messages` are MSG keys (static frames); the Full MVP passes ready-made rows as `list`. */
export function ChatBase({ title = ['Daughter', '女儿'], messages = [], list, input = 'plain', links = {}, inputProps, children }) {
  const scroller = useRef(null);
  const count = list ? list.length : 0;
  useEffect(() => {
    const el = scroller.current;
    if (list && el) el.scrollTop = el.scrollHeight;
  }, [count, list]);
  return (
    <Screen>
      <StatusBar />
      <NavBar title={title} back={links.back} home={links.home} />
      <div
        ref={scroller}
        className={list ? 'cm-scroll' : undefined}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: list ? undefined : 'hidden',
          overflowY: list ? 'auto' : undefined,
          boxSizing: 'border-box',
          padding: list ? '14px 16px 14px 16px' : '14px 16px 0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {list ||
          messages.map((m, i) => (
            <MsgFragment key={i} k={m} />
          ))}
      </div>
      <InputArea mode={input} links={links} {...inputProps} />
      {children}
    </Screen>
  );
}

function MsgFragment({ k }) {
  const El = MSG[k];
  return <El l={useL()} />;
}

export { Abs, Avatar };

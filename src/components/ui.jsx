// Shared building blocks that mirror the Figma "CM/…" components.
// All sizes are in Figma px on a 393 x 852 frame; the phone shell scales the whole frame.
import { createContext, useContext } from 'react';
import PATHS from './iconPaths.js';
import statusBar from '../assets/statusbar.jpg';

export const C = {
  bg: '#ededed',
  white: '#ffffff',
  text: '#121212',
  sub: '#6b6b6b',
  subCn: '#7d7d7d',
  green: '#07c160',
  greenIcon: '#07a355',
  greenDark: '#05683a',
  greenLight: '#e6f8ee',
  neutral: '#e4e4e4',
  neutralCn: '#555555',
  border: '#d9d9d9',
  field: '#f5f5f5',
  chip: '#f2f2f2',
  bubble: '#95ec69',
  yellow: '#ffd60a',
};

const INTER = "'Inter', 'Noto Sans SC', system-ui, sans-serif";
const NOTO = "'Noto Sans SC', 'Inter', system-ui, sans-serif";

/* ---------- navigation context (prototype links) ---------- */
export const NavCtx = createContext({ go: () => {}, interactive: false });
export const useGo = () => useContext(NavCtx).go;

/** Make an element a prototype hotspot. `to` is a screen id, or a function. */
export function useHot(to) {
  const { go, interactive } = useContext(NavCtx);
  if (!interactive || to == null) return {};
  return {
    'data-hot': '',
    role: 'button',
    tabIndex: 0,
    onClick: (e) => {
      e.stopPropagation();
      typeof to === 'function' ? to() : go(to);
    },
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        typeof to === 'function' ? to() : go(to);
      }
    },
  };
}

/* ---------- primitives ---------- */
export function T({ f = 'inter', w = 400, s, lh, c = C.text, align, nowrap, style, children }) {
  return (
    <div
      style={{
        fontFamily: f === 'noto' ? NOTO : INTER,
        fontWeight: w,
        fontSize: s,
        lineHeight: `${lh}px`,
        color: c,
        textAlign: align,
        whiteSpace: nowrap ? 'pre' : 'pre-wrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Icon({ name, size = 24, color = C.text, sw = 2, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={(sw * 24) / size}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}
      aria-hidden="true"
    >
      {PATHS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Inside stroke, like Figma: drawn with an inset shadow so it never affects layout. */
export const stroke = (w, color) => `inset 0 0 0 ${w}px ${color}`;

export function Photo({ src, size, style }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0, ...style }}
    />
  );
}

export function Abs({ x, y, w, h, style, children, ...rest }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }} {...rest}>
      {children}
    </div>
  );
}

/* ---------- frame chrome ---------- */
export function Screen({ children, style }) {
  return (
    <div
      className="cm-screen"
      style={{
        width: 393,
        height: 852,
        position: 'relative',
        overflow: 'hidden',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatusBar() {
  return (
    <div style={{ width: 393, height: 43, flexShrink: 0, background: '#eeeeee' }}>
      <img src={statusBar} alt="" draggable={false} style={{ width: 393, height: 43, display: 'block', objectFit: 'cover' }} />
    </div>
  );
}

/** Two-line label (English + Chinese) used inside pill buttons. */
function PillLabels({ en, cn, enSize = 18, enLh = 22, enW = 600, cnSize = 13, cnLh = 16, cnColor = C.subCn, color = C.text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <T w={enW} s={enSize} lh={enLh} c={color} nowrap>{en}</T>
      <T f="noto" s={cnSize} lh={cnLh} c={cnColor} nowrap style={{ marginTop: -2 }}>{cn}</T>
    </div>
  );
}

export function NavPill({ icon, en, cn, to, iconSize = 26, pad = '6px 14px 6px 10px', height = 52, style, labels }) {
  const hot = useHot(to);
  return (
    <div
      {...hot}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: pad,
        height,
        boxSizing: 'border-box',
        background: C.white,
        borderRadius: 24,
        flexShrink: 0,
        ...style,
      }}
    >
      <Icon name={icon} size={iconSize} />
      <PillLabels en={en} cn={cn} {...labels} />
    </div>
  );
}

export function NavBar({ title, back, home }) {
  return (
    <div
      style={{
        height: 72,
        flexShrink: 0,
        padding: '0 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: C.bg,
      }}
    >
      <NavPill icon="arrow-left" en="Back" cn="返回" to={back} />
      <T w={700} s={22} lh={27} nowrap>{title}</T>
      <NavPill icon="home" en="Home" cn="主页" to={home} />
    </div>
  );
}

/* ---------- CM/Button Large ---------- */
const BTN = {
  primary: { bg: C.green, fg: C.white, cn: C.greenLight, icon: C.white, shadow: undefined },
  secondary: { bg: C.white, fg: C.text, cn: C.subCn, icon: C.green, shadow: stroke(2, C.green) },
  neutral: { bg: C.neutral, fg: C.text, cn: C.neutralCn, icon: C.text, shadow: undefined },
};

export function Btn({ kind = 'primary', icon, label, cn, w = '100%', h = 76, pl = 24, pr = 24, gap = 16, iconColor, to, style }) {
  const k = BTN[kind];
  const hot = useHot(to);
  return (
    <div
      {...hot}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap,
        padding: `0 ${pr}px 0 ${pl + (kind === 'secondary' ? 2 : 0)}px`, // Figma lays out secondary content 2px in (stroke counted)
        width: w,
        height: h,
        boxSizing: 'border-box',
        borderRadius: 16,
        background: k.bg,
        boxShadow: k.shadow,
        flexShrink: 0,
        ...style,
      }}
    >
      <Icon name={icon} size={30} color={iconColor || k.icon} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <T w={600} s={22} lh={27} c={k.fg} nowrap>{label}</T>
        <T f="noto" s={16} lh={19} c={k.cn} nowrap>{cn}</T>
      </div>
    </div>
  );
}

/* ---------- small pills ---------- */
export function ActionPill({ icon, text, to, style }) {
  const hot = useHot(to);
  return (
    <div
      {...hot}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: 36,
        boxSizing: 'border-box',
        padding: '6px 12px 6px 10px',
        background: C.white,
        borderRadius: 18,
        boxShadow: stroke(1, C.border),
        ...style,
      }}
    >
      <Icon name={icon} size={22} color={C.greenIcon} />
      <T f="noto" w={500} s={16} lh={19} nowrap>{text}</T>
    </div>
  );
}

/* ---------- floating helpers on the contact page ---------- */
export function HelpButton({ to }) {
  const hot = useHot(to);
  return (
    <Abs
      x={261}
      y={758}
      w={116}
      h={60}
      {...hot}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px 10px 14px',
        boxSizing: 'border-box',
        background: C.white,
        borderRadius: 30,
        boxShadow: `${stroke(1.5, C.border)}, 0 3px 10px rgba(0,0,0,0.12)`,
      }}
    >
      <Icon name="help" size={30} color={C.green} />
      <PillLabels en="Help" cn="帮助" enSize={19} enLh={23} enW={700} />
    </Abs>
  );
}

export function ShowMeHow({ to }) {
  const hot = useHot(to);
  return (
    <Abs
      x={16}
      y={762}
      w={181}
      h={56}
      {...hot}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 16px 10px 12px',
        boxSizing: 'border-box',
        background: C.greenLight,
        borderRadius: 30,
      }}
    >
      <Icon name="bulb" size={26} color={C.greenIcon} />
      <PillLabels en="Show me how" cn="教我用" color={C.greenDark} cnColor={C.greenDark} />
    </Abs>
  );
}

/* ---------- overlays ---------- */
export function Dim({ op = 0.45, to }) {
  const hot = useHot(to);
  return <Abs x={0} y={0} w={393} h={852} {...hot} style={{ background: `rgba(0,0,0,${op})` }} />;
}

export function Sheet({ y, pad, gap, align = 'stretch', children }) {
  return (
    <Abs
      x={0}
      y={y}
      w={393}
      h={852 - y}
      style={{
        background: C.white,
        borderRadius: '24px 24px 0 0',
        padding: pad,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: align,
        gap,
      }}
    >
      {children}
    </Abs>
  );
}

export function Banner({ type = 'success', title, message, y = 124, h = 77, style }) {
  const ok = type === 'success';
  return (
    <div
      style={{
        position: ok ? 'absolute' : 'relative',
        left: ok ? 16 : undefined,
        top: ok ? y : undefined,
        width: 361,
        height: h,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        borderRadius: 16,
        background: ok ? C.green : '#fff4e5',
        boxShadow: `${ok ? '' : stroke(2, '#f79009') + ', '}0 4px 12px rgba(0,0,0,0.15)`,
        flexShrink: 0,
        ...style,
      }}
    >
      <Icon name={ok ? 'check' : 'alert'} size={34} color={ok ? C.white : '#dc6803'} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: ok ? 277 : 273 }}>
        <T w={700} s={20} lh={24} c={ok ? C.white : '#7a2e0e'}>{title}</T>
        <T f="noto" s={16} lh={19} c={ok ? C.white : '#7a2e0e'}>{message}</T>
      </div>
    </div>
  );
}

/* ---------- guide (coach marks) ---------- */
export function GuideBar({ exit }) {
  return (
    <Abs
      x={0}
      y={43}
      w={393}
      h={72}
      style={{
        background: C.greenDark,
        padding: '10px 12px 10px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <T w={700} s={19} lh={23} c={C.white} nowrap>Guide: Send a message</T>
        <T f="noto" s={14} lh={17} c="#cdefd9" nowrap>正在教：怎么发消息</T>
      </div>
      <NavPill
        icon="x"
        iconSize={22}
        en="Exit guide"
        cn="退出教学"
        to={exit}
        pad="8px 14px 8px 10px"
        height={49}
        labels={{ enSize: 17, enLh: 21, cnSize: 12, cnLh: 14, cnColor: C.sub }}
      />
    </Abs>
  );
}

export function ReadAloud({ style }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        width: 133,
        height: 36,
        boxSizing: 'border-box',
        padding: '6px 12px 6px 10px',
        background: C.white,
        borderRadius: 18,
        boxShadow: stroke(1, C.border),
        ...style,
      }}
    >
      <Icon name="volume" size={22} color={C.greenIcon} />
      <T w={600} s={15} lh={18} nowrap>Read aloud</T>
    </div>
  );
}

export function GuideCard({ y, step, title, cn, close, next }) {
  return (
    <Abs
      x={16}
      y={y}
      w={361}
      style={{
        background: C.white,
        borderRadius: 20,
        padding: '16px 20px 18px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ height: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 183, height: 29, boxSizing: 'border-box', padding: '5px 12px', background: C.greenLight, borderRadius: 14 }}>
          <T f="noto" w={500} s={16} lh={19} c={C.greenDark} nowrap>{step}</T>
        </div>
        <ReadAloud />
      </div>
      <T w={700} s={22} lh={27}>{title}</T>
      <T f="noto" s={18} lh={22} c={C.sub}>{cn}</T>
      <div style={{ height: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="pointer" size={20} color="#b08800" />
        <T w={500} s={15} lh={18} c="#7a5c00" nowrap>Tap the glowing button, or press Next</T>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn kind="neutral" icon="x" label="Close" cn="关闭" w={156} h={64} to={close} />
        <Btn kind="primary" icon="chevron-right" label="Next" cn="下一步" w={156} h={64} to={next} />
      </div>
    </Abs>
  );
}

/** Yellow glow ring around the spotlight target (stroke inside + soft glow both ways). */
export function Glow({ x, y, w, h, r, width = 5, glow = true }) {
  return (
    <Abs
      x={x}
      y={y}
      w={w}
      h={h}
      style={{
        borderRadius: r,
        pointerEvents: 'none',
        boxShadow: glow
          ? `inset 0 0 0 ${width}px ${C.yellow}, 0 0 16px 2px rgba(255,214,10,0.7), inset 0 0 16px 2px rgba(255,214,10,0.7)`
          : `inset 0 0 0 ${width}px ${C.yellow}`,
      }}
    />
  );
}

export function Pointer({ x, y, size = 56 }) {
  return (
    <Abs x={x} y={y} w={size} h={size} style={{ pointerEvents: 'none' }} className="cm-pointer">
      <Icon name="pointer" size={size} color={C.yellow} sw={2.5} />
    </Abs>
  );
}

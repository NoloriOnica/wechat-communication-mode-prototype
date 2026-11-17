// "Read aloud" for the Full MVP, using the browser's built-in voices (no permissions needed).
import { useEffect, useState } from 'react';

let current = null; // id of the item being read
const subs = new Set();
const emit = () => subs.forEach((f) => f(current));

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
  current = null;
  emit();
}

/** Speak `text` in 'en' or 'zh'. Calling again with the same id stops it. */
export function speak(text, lang, id = text) {
  if (!canSpeak() || !text) return;
  const again = current === id;
  stopSpeaking();
  if (again) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'zh' ? 'zh-CN' : 'en-GB';
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.replace('_', '-').startsWith(u.lang.slice(0, 2)));
  if (voice) u.voice = voice;
  u.rate = 0.9; // a little slower, easier to follow
  u.onend = u.onerror = () => {
    if (current === id) {
      current = null;
      emit();
    }
  };
  current = id;
  emit();
  window.speechSynthesis.speak(u);
}

/** The id currently being read, or null. */
export function useSpeaking() {
  const [id, setId] = useState(current);
  useEffect(() => {
    subs.add(setId);
    return () => subs.delete(setId);
  }, []);
  return id;
}

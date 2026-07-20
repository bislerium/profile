import { TextScramble } from './text-scramble';
import { KathmanduClock } from './kathmandu-clock';
import { PERSON } from '../constants';

const registerSW = () => {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch((err) =>
    console.warn('SW registration failed:', err),
  );
};

const initOfflineBanner = () => {
  // Only show in PWA standalone mode, not in regular browser tabs
  if (!window.matchMedia('(display-mode: standalone)').matches) return;

  const indicator = document.getElementById('offline-indicator');
  if (!indicator) return;

  const toggle = () => {
    indicator.hidden = navigator.onLine;
  };
  window.addEventListener('offline', toggle);
  window.addEventListener('online', toggle);
  toggle();
};

const init = () => {
  registerSW();
  initOfflineBanner();
  const nameLines = document.querySelectorAll('.name-line');
  const scramblers = Array.from(nameLines).map(el => new TextScramble(el as HTMLElement));

  setTimeout(() => scramblers[0]?.setText(PERSON.nameParts[0]), 300);
  setTimeout(() => scramblers[1]?.setText(PERSON.nameParts[1]), 500);
  setTimeout(() => scramblers[2]?.setText(PERSON.nameParts[2]), 700);

  const clockEl = document.getElementById('kathmandu-clock') as HTMLTimeElement | null;
  if (clockEl) new KathmanduClock(clockEl);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

import { TextScramble } from './text-scramble';
import { KathmanduClock } from './kathmandu-clock';

const registerSW = () => {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch((err) =>
    console.warn('SW registration failed:', err),
  );

  // Listen for messages from the SW (e.g., offline fallback notification)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'OFFLINE_FALLBACK') {
      document.documentElement.dataset.offline = '';
    }
  });
};

const init = () => {
  registerSW();
  const nameLines = document.querySelectorAll('.name-line');
  const scramblers = Array.from(nameLines).map(el => new TextScramble(el as HTMLElement));

  setTimeout(() => scramblers[0]?.setText('Bishal'), 300);
  setTimeout(() => scramblers[1]?.setText('Gharti'), 500);
  setTimeout(() => scramblers[2]?.setText('Chhetri'), 700);

  const clockEl = document.getElementById('kathmandu-clock') as HTMLTimeElement | null;
  if (clockEl) new KathmanduClock(clockEl);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

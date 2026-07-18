import { TextScramble } from './text-scramble';
import { KathmanduClock } from './kathmandu-clock';

const init = () => {
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

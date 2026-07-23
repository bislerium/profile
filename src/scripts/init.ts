import { TextScramble } from './text-scramble';
import { Clock } from './clock';
import { PERSON } from '../constants';

const init = () => {
  const nameLines = document.querySelectorAll('.name-line');
  const scramblers = Array.from(nameLines).map(el => new TextScramble(el as HTMLElement));

  scramblers.forEach((s, i) => {
    setTimeout(() => s?.setText(PERSON.nameParts[i]), 300 + i * 200);
  });

  const clockEl = document.getElementById('clock') as HTMLTimeElement | null;
  if (clockEl) new Clock(clockEl);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

import { TextScramble } from './_components/Name/text-scramble';
import { Clock } from './_components/Footer/clock';
import { initStackToggle } from './_components/Stack/stack-toggle';
import { initAutoCycle } from './_components/Stack/auto-cycle';
import { PERSON } from 'src/pages/portfolio/_constants';

const init = () => {
  const nameLines = document.querySelectorAll('.name-line');
  const scramblers = Array.from(nameLines).map(el => new TextScramble(el as HTMLElement));

  scramblers.forEach((s, i) => {
    setTimeout(() => s?.setText(PERSON.nameParts[i]), 300 + i * 200);
  });

  const clockEl = document.getElementById('clock') as HTMLTimeElement | null;
  if (clockEl) new Clock(clockEl);

  initStackToggle();
  initAutoCycle();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

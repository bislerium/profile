import { TextScramble } from './_components/Name/text-scramble';
import { Clock } from './_components/Footer/clock';
import { initStackToggle } from './_components/Stack/stack-toggle';
import { initAutoCycle } from './_components/Stack/auto-cycle';
import { PERSON } from 'src/pages/portfolio/_constants';
import { trackAccessibilityPref, trackCvClick, trackGithubClick, trackLinkedinClick } from 'src/pages/portfolio/_ga-events';

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

  // Delegated click listener for GA4 data-track attributes.
  // No inline onclick needed — attribute drives which event fires.
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest('[data-track]');
    if (!el) return;
    const event = el.getAttribute('data-track');
    if (event === 'cv_click') trackCvClick();
    else if (event === 'github_click') trackGithubClick();
    else if (event === 'linkedin_click') trackLinkedinClick();
  });

  trackAccessibilityPref();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

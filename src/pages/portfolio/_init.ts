import { TextScramble } from './_components/Name/text-scramble';
import { Clock } from './_components/Footer/clock';
import { initStackToggle } from './_components/Stack/stack-toggle';
import { PERSON } from 'src/pages/portfolio/_constants';
import { trackAccessibilityPref, trackCvClick, trackGithubClick, trackLinkedinClick } from 'src/pages/portfolio/_ga-events';

const init = () => {
  const nameLines = document.querySelectorAll<HTMLElement>('.name-line');
  const scramblers = Array.from(nameLines, el => new TextScramble(el));

  scramblers.forEach((s, i) => {
    setTimeout(() => s.setText(PERSON.nameParts[i]), 300 + i * 200);
  });

  const clockEl = document.querySelector<HTMLTimeElement>('#clock');
  if (clockEl) new Clock(clockEl);

  initStackToggle();

  // Delegated click listener for GA4 data-track attributes.
  // No inline onclick needed — attribute drives which event fires.
  const trackers = {
    cv_click: trackCvClick,
    github_click: trackGithubClick,
    linkedin_click: trackLinkedinClick,
  } as const;

  document.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    const el = e.target.closest('[data-track]');
    if (!el) return;
    const event = el.getAttribute('data-track') as keyof typeof trackers | null;
    trackers[event!]?.();
  });

  trackAccessibilityPref();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

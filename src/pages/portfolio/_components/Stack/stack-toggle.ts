import { trackStackExpand } from 'src/pages/portfolio/_ga-events';

/**
 * Syncs a single parent's aria-expanded with its visual state.
 * Checks CSS pseudo-classes PLUS the .stack-open class.
 */
function syncStackParent(parent: Element): void {
  const nameEl = parent.querySelector<HTMLElement>('.stack-category');
  if (!nameEl) return;
  const expanded =
    parent.matches(':hover') ||
    parent.matches(':focus-within') ||
    parent.classList.contains('stack-open');
  nameEl.setAttribute('aria-expanded', String(expanded));
}

/** Extracts the stack category name from a .stack-parent element. */
function getCategoryName(parent: Element): string {
  return parent.querySelector('.stack-category')?.textContent?.trim() ?? '';
}

/** Syncs aria-expanded on all stack category items with their visual state. */
function syncAllStackAria(): void {
  document.querySelectorAll<HTMLElement>('.stack-parent').forEach(syncStackParent);
}

/**
 * Desktop (hover: hover): hover + keyboard focus reveal. Mouse clicks do NOT
 *   persist focus — pointerdown calls preventDefault() so :focus-within only
 *   activates via keyboard Tab, not mouse click.
 *
 * Touch (hover: none): tap toggles .stack-open with mutual exclusion. Only one
 *   item open at a time. Tap outside the stack to dismiss.
 */
export function initStackToggle(): void {
  const parents = document.querySelectorAll<HTMLElement>('.stack-parent');
  if (parents.length === 0) return;

  const isTouchDevice = !window.matchMedia('(hover: hover)').matches;

  for (const parent of parents) {
    // Prevent pointer (mouse/touch) from focusing the button — stops
    // :focus-within from making the sublist persist after tap-to-close.
    // Keyboard Tab still focuses normally (doesn't fire pointerdown).
    parent.addEventListener('pointerdown', (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (e.target.closest('.stack-category')) {
        e.preventDefault();
      }
    });

    // --- Touch: tap to toggle .stack-open (mutual exclusion) ---
    if (isTouchDevice) {
      parent.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        if (!e.target.closest('.stack-category')) return;

        const wasOpen = parent.classList.contains('stack-open');

        for (const p of parents) {
          p.classList.remove('stack-open');
        }

        parent.classList.toggle('stack-open', !wasOpen);
        if (!wasOpen) trackStackExpand(getCategoryName(parent));

        syncAllStackAria();
      });
    }

    // --- Hover ---
    parent.addEventListener('mouseenter', () => {
      syncStackParent(parent);
      trackStackExpand(getCategoryName(parent));
    });
    parent.addEventListener('mouseleave', () => {
      requestAnimationFrame(() => syncStackParent(parent));
    });

    // --- Keyboard focus ---
    parent.addEventListener('focusin', () => {
      syncStackParent(parent);
      trackStackExpand(getCategoryName(parent));
    });
    parent.addEventListener('focusout', () => {
      requestAnimationFrame(() => syncStackParent(parent));
    });
  }

  // --- Touch: dismiss tapped items when clicking outside the stack ---
  if (isTouchDevice) {
    document.addEventListener('click', (e) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (e.target.closest('.tech-stack')) return;
      for (const p of parents) {
        p.classList.remove('stack-open');
      }
      syncAllStackAria();
    });
  }
}

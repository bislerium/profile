import { trackStackExpand } from 'src/pages/portfolio/_ga-events';

/**
 * Syncs a single parent's aria-expanded with its visual state.
 * Checks CSS pseudo-classes PLUS the .stack-active and .stack-open classes.
 */
function syncStackParent(parent: Element): void {
  const nameEl = parent.querySelector<HTMLElement>('.stack-category');
  if (!nameEl) return;
  const expanded =
    parent.matches(':hover') ||
    parent.matches(':focus-within') ||
    parent.classList.contains('stack-active') ||
    parent.classList.contains('stack-open');
  nameEl.setAttribute('aria-expanded', String(expanded));
}

/** Extracts the stack category name from a .stack-parent element. */
function getCategoryName(parent: Element): string {
  return parent.querySelector('.stack-category')?.textContent?.trim() ?? '';
}

/**
 * Syncs aria-expanded on all stack category items with their visual state.
 * Exported so auto-cycle can call it after class changes.
 */
export function syncAllStackAria(): void {
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
    // --- Desktop: prevent mouse click from focusing the button ---
    // Clicking a <button> inherently focuses it, which triggers :focus-within
    // and makes the sublist persist. preventDefault() on pointerdown stops
    // focus for mouse clicks while leaving keyboard Tab focus intact.
    if (!isTouchDevice) {
      parent.addEventListener('pointerdown', (e) => {
        if ((e.target as HTMLElement).closest('.stack-category')) {
          e.preventDefault();
        }
      });
    }

    // --- Touch: tap to toggle .stack-open (mutual exclusion) ---
    if (isTouchDevice) {
      parent.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.stack-category')) return;

        const wasOpen = parent.classList.contains('stack-open');

        for (const p of parents) {
          p.classList.remove('stack-open');
        }

        if (!wasOpen) {
          parent.classList.add('stack-open');
          trackStackExpand(getCategoryName(parent));
        }

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
      const target = e.target as HTMLElement;
      if (target.closest('.tech-stack')) return;
      for (const p of parents) {
        p.classList.remove('stack-open');
      }
      syncAllStackAria();
    });
  }
}

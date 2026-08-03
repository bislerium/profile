import { trackStackExpand } from 'src/pages/portfolio/_ga-events';

/**
 * Syncs a single parent's aria-expanded with its visual state.
 * Checks CSS pseudo-classes PLUS the .stack-active class used by auto-cycle.
 */
function syncStackParent(parent: Element): void {
  const nameEl = parent.querySelector<HTMLElement>('.stack-category');
  if (!nameEl) return;
  const expanded =
    parent.matches(':hover') ||
    parent.matches(':focus-within') ||
    parent.classList.contains('stack-active');
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
 * Syncs aria-expanded on stack category items with their visual hover/focus state.
 * Reads the CSS-driven :hover and :focus-within pseudo-class state so ARIA stays
 * in sync without duplicating the CSS logic or changing existing behavior.
 * Also fires GA4 stack_expand event on manual user interaction (not auto-cycle).
 */
export function initStackToggle(): void {
  const parents = document.querySelectorAll<HTMLElement>('.stack-parent');
  if (parents.length === 0) return;

  for (const parent of parents) {
    parent.addEventListener('mouseenter', () => {
      syncStackParent(parent);
      trackStackExpand(getCategoryName(parent));
    });
    parent.addEventListener('mouseleave', () => {
      // Defer so :focus-within takes precedence if focus just moved in
      requestAnimationFrame(() => syncStackParent(parent));
    });
    parent.addEventListener('focusin', () => {
      syncStackParent(parent);
      trackStackExpand(getCategoryName(parent));
    });
    parent.addEventListener('focusout', () => {
      // Defer so :hover takes precedence if mouse is still over the parent
      requestAnimationFrame(() => syncStackParent(parent));
    });
  }
}

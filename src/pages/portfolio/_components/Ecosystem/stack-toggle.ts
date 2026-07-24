/**
 * Syncs aria-expanded on stack category items with their visual hover/focus state.
 * Reads the CSS-driven :hover and :focus-within pseudo-class state so ARIA stays
 * in sync without duplicating the CSS logic or changing existing behavior.
 */
export function initStackToggle(): void {
  const parents = document.querySelectorAll<HTMLElement>('.eco-parent');
  if (parents.length === 0) return;

  const update = (parent: Element) => {
    const nameEl = parent.querySelector<HTMLElement>('.eco-parent-name');
    if (!nameEl) return;
    const expanded = parent.matches(':hover') || parent.matches(':focus-within');
    nameEl.setAttribute('aria-expanded', String(expanded));
  };

  for (const parent of parents) {
    parent.addEventListener('mouseenter', () => update(parent));
    parent.addEventListener('mouseleave', () => {
      // Defer so :focus-within takes precedence if focus just moved in
      requestAnimationFrame(() => update(parent));
    });
    parent.addEventListener('focusin', () => update(parent));
    parent.addEventListener('focusout', () => {
      // Defer so :hover takes precedence if mouse is still over the parent
      requestAnimationFrame(() => update(parent));
    });
  }
}

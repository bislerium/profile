export class TextScramble {
  #el: HTMLElement;
  #chars = '!<>-_\\/[]{}—=+*^?#________' as const;
  #queue: Array<{ from: string; to: string; start: number; end: number; char: string | null }> = [];
  #frame = 0;
  #frameRequest: number | null = null;
  #resolve: (() => void) | null = null;
  #reducedMotion = false;

  constructor(el: HTMLElement) {
    this.#el = el;
    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  setText(newText: string): Promise<void> {
    if (this.#reducedMotion) {
      this.#el.textContent = newText;
      return Promise.resolve();
    }

    const oldText = this.#el.innerText;
    const length = Math.max(oldText.length, newText.length);

    const promise = new Promise<void>((resolve) => { this.#resolve = resolve; });
    this.#queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.#queue.push({ from, to, start, end, char: null });
    }

    cancelAnimationFrame(this.#frameRequest!);
    this.#frame = 0;
    this.#update();

    return promise;
  }

  #update = () => {
    const fragment = document.createDocumentFragment();
    let complete = 0;

    for (const item of this.#queue) {
      if (this.#frame >= item.end) {
        complete++;
        fragment.appendChild(document.createTextNode(item.to));
      } else if (this.#frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.#randomChar();
        }
        const span = document.createElement('span');
        span.style.color = 'var(--violet-bright)';
        span.style.opacity = '0.6';
        span.textContent = item.char;
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(item.from));
      }
    }

    this.#el.replaceChildren(fragment);

    if (complete === this.#queue.length) {
      this.#resolve?.();
    } else {
      this.#frameRequest = requestAnimationFrame(this.#update);
      this.#frame++;
    }
  };

  #randomChar(): string {
    return this.#chars[Math.floor(Math.random() * this.#chars.length)];
  }
}

export class TextScramble {
  #el: HTMLElement;
  #chars = '!<>-_\\/[]{}—=+*^?#________';
  #queue: Array<{ from: string; to: string; start: number; end: number; char: string | null }> = [];
  #frame = 0;
  #frameRequest: number | null = null;
  #resolve: (() => void) | null = null;
  #reducedMotion = false;
  #glitchTimer: ReturnType<typeof setTimeout> | null = null;
  #glitchFrame: number | null = null;
  #currentText = '';

  constructor(el: HTMLElement) {
    this.#el = el;
    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  setText(newText: string): Promise<void> {
    this.#currentText = newText;
    this.#cancelGlitch();

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
      this.#scheduleGlitch();
    } else {
      this.#frameRequest = requestAnimationFrame(this.#update);
      this.#frame++;
    }
  };

  /** Schedule the next random glitch burst after a random delay (2–8s). */
  #scheduleGlitch() {
    if (this.#reducedMotion) return;
    const delay = 2000 + Math.random() * 6000;
    this.#glitchTimer = setTimeout(() => this.#runGlitch(), delay);
  }

  /** Scramble a random handful of characters for a few frames, then restore. */
  #runGlitch() {
    const text = this.#currentText;
    if (!text) return;

    const len = text.length;
    const glitchCount = Math.min(1 + Math.floor(Math.random() * 3), len);
    const positions = new Set<number>();
    while (positions.size < glitchCount) {
      positions.add(Math.floor(Math.random() * len));
    }

    // Glitch for 4–12 frames (~67–200 ms at 60 fps)
    const totalFrames = 4 + Math.floor(Math.random() * 9);
    let frame = 0;

    const animate = () => {
      if (frame >= totalFrames) {
        this.#el.textContent = text;
        this.#scheduleGlitch();
        return;
      }

      const fragment = document.createDocumentFragment();

      for (let i = 0; i < len; i++) {
        if (positions.has(i)) {
          const span = document.createElement('span');
          span.style.color = 'var(--violet-bright)';
          span.style.opacity = String(0.3 + Math.random() * 0.5);
          span.textContent = this.#randomChar();
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(text[i]));
        }
      }

      this.#el.replaceChildren(fragment);
      frame++;
      this.#glitchFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  /** Cancel any pending or in-progress glitch. */
  #cancelGlitch() {
    if (this.#glitchTimer !== null) {
      clearTimeout(this.#glitchTimer);
      this.#glitchTimer = null;
    }
    if (this.#glitchFrame !== null) {
      cancelAnimationFrame(this.#glitchFrame);
      this.#glitchFrame = null;
    }
  }

  #randomChar(): string {
    return this.#chars[Math.floor(Math.random() * this.#chars.length)];
  }
}

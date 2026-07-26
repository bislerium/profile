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
  #pageVisible = true;

  constructor(el: HTMLElement) {
    this.#el = el;
    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('visibilitychange', () => {
      this.#pageVisible = !document.hidden;
      if (document.hidden) {
        this.#cancelGlitch();
      } else if (this.#currentText) {
        this.#scheduleGlitch();
      }
    });
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
    let complete = 0;

    if (this.#frame === 0) {
      // Frame 0: build the DOM once — all characters wrapped in <span>
      const fragment = document.createDocumentFragment();
      for (const item of this.#queue) {
        const span = document.createElement('span');
        span.textContent = item.from;
        fragment.appendChild(span);
      }
      this.#el.replaceChildren(fragment);
    }

    // Update each span in place — no DOM rebuilds
    const children = this.#el.children;
    for (let i = 0; i < this.#queue.length; i++) {
      const item = this.#queue[i];
      const span = children[i] as HTMLSpanElement;

      if (this.#frame >= item.end) {
        complete++;
        span.textContent = item.to;
        span.style.color = '';
        span.style.opacity = '';
      } else if (this.#frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.#randomChar();
        }
        span.textContent = item.char!;
        span.style.color = 'var(--violet-bright)';
        span.style.opacity = '0.6';
      }
      // else: still in "from" phase — span already has item.from from frame 0
    }

    if (complete === this.#queue.length) {
      // Clean up: replace all spans with a single text node
      this.#el.textContent = this.#currentText;
      this.#resolve?.();
      this.#scheduleGlitch();
    } else {
      this.#frameRequest = requestAnimationFrame(this.#update);
      this.#frame++;
    }
  };

  /** Schedule a glitch burst after 1.5–5s idle. */
  #scheduleGlitch() {
    if (this.#reducedMotion || !this.#pageVisible) return;
    const delay = 1500 + Math.random() * 3500;
    this.#glitchTimer = setTimeout(() => this.#runGlitch(), delay);
  }

  /**
   * Scramble 1–3 characters for 4–10 frames.
   * Builds DOM once on frame 1, reuses spans on frames 2+ — only textContent changes.
   */
  #runGlitch() {
    if (!this.#pageVisible) return;
    const text = this.#currentText;
    if (!text) return;

    const len = text.length;
    const glitchCount = Math.min(1 + Math.floor(Math.random() * 3), len);
    const positions = new Set<number>();
    while (positions.size < glitchCount) {
      positions.add(Math.floor(Math.random() * len));
    }

    const totalFrames = 4 + Math.floor(Math.random() * 7);
    let frame = 0;
    let glitchSpans: HTMLSpanElement[] = [];
    let initialized = false;

    const animate = () => {
      if (!this.#pageVisible) {
        this.#el.textContent = text;
        return;
      }

      if (frame >= totalFrames) {
        this.#el.textContent = text;
        this.#scheduleGlitch();
        return;
      }

      if (!initialized) {
        // Frame 1: build DOM structure with <span> at glitch positions
        const fragment = document.createDocumentFragment();
        glitchSpans = [];
        for (let i = 0; i < len; i++) {
          if (positions.has(i)) {
            const span = document.createElement('span');
            span.style.color = 'var(--violet-bright)';
            span.textContent = this.#randomChar();
            fragment.appendChild(span);
            glitchSpans.push(span);
          } else {
            fragment.appendChild(document.createTextNode(text[i]));
          }
        }
        this.#el.replaceChildren(fragment);
        initialized = true;
      } else {
        // Frames 2+: only update span contents — no DOM structure changes
        for (const span of glitchSpans) {
          span.style.opacity = String(0.3 + Math.random() * 0.5);
          span.textContent = this.#randomChar();
        }
      }

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

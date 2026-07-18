export class TextScramble {
  private el: HTMLElement;
  private chars: string = '!<>-_\\/[]{}—=+*^?#________';
  private queue: Array<{ from: string; to: string; start: number; end: number; char: string | null }> = [];
  private frame: number = 0;
  private frameRequest: number | null = null;
  private resolve: (() => void) | null = null;
  private reducedMotion: boolean = false;

  constructor(el: HTMLElement) {
    this.el = el;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  setText(newText: string): Promise<void> {
    if (this.reducedMotion) {
      this.el.textContent = newText;
      return Promise.resolve();
    }

    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);

    const promise = new Promise<void>((resolve) => { this.resolve = resolve; });
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end, char: null });
    }

    cancelAnimationFrame(this.frameRequest!);
    this.frame = 0;
    this.update();

    return promise;
  }

  private update = () => {
    let output = '';
    let complete = 0;

    for (const item of this.queue) {
      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.randomChar();
        }
        output += `<span style="color:var(--violet-bright);opacity:0.6">${item.char}</span>`;
      } else {
        output += item.from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve?.();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  };

  private randomChar(): string {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

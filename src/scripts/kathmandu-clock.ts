export class KathmanduClock {
  #el: HTMLElement;
  #formatter: Intl.DateTimeFormat;
  #zoneFormatter: Intl.DateTimeFormat;
  #interval: ReturnType<typeof setInterval> | null = null;

  constructor(el: HTMLElement) {
    this.#el = el;
    this.#formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    this.#zoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      timeZoneName: 'shortOffset',
    });

    this.#update();
    this.#interval = setInterval(() => this.#update(), 60_000);
  }

  /** Stop the clock interval. Call when the element is removed from the DOM. */
  destroy() {
    if (this.#interval !== null) {
      clearInterval(this.#interval);
      this.#interval = null;
    }
  }

  #update() {
    const now = new Date();
    const time = this.#formatter.format(now);
    const zonePart = this.#zoneFormatter.formatToParts(now).find(p => p.type === 'timeZoneName');
    const zone = zonePart?.value ?? 'GMT+5:45';

    this.#el.textContent = `Kathmandu, Nepal · ${time} · ${zone}`;
    this.#el.dateTime = now.toISOString();
  }
}

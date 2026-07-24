import { PERSON } from 'src/pages/index/_constants';

export class Clock {
  #el: HTMLTimeElement;
  #formatter: Intl.DateTimeFormat;
  #zoneFormatter: Intl.DateTimeFormat;
  #interval: ReturnType<typeof setInterval> | null = null;

  constructor(el: HTMLTimeElement) {
    this.#el = el;
    this.#formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: PERSON.timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    this.#zoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: PERSON.timezone,
      timeZoneName: 'shortOffset',
    });

    this.#update();
    this.#interval = setInterval(() => this.#update(), 60_000);
  }

  #update() {
    const now = new Date();
    const time = this.#formatter.format(now);
    const zonePart = this.#zoneFormatter.formatToParts(now).find(p => p.type === 'timeZoneName');
    const zone = zonePart?.value ?? PERSON.timezone;

    this.#el.textContent = `${PERSON.clockLabel} · ${time} · ${zone}`;
    this.#el.dateTime = now.toISOString();
  }
}

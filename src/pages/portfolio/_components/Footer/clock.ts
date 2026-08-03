import { PERSON } from 'src/pages/portfolio/_constants';

export class Clock {
  #el: HTMLTimeElement;
  #formatter: Intl.DateTimeFormat;
  #zoneFormatter: Intl.DateTimeFormat;
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

    // Align to real minute boundaries — first tick fires at :00 seconds,
    // then every 60s after. Avoids drift from page-load-time alignment.
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(() => {
      this.#update();
      setInterval(() => this.#update(), 60_000);
    }, msToNextMinute);
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

export class KathmanduClock {
  private el: HTMLElement;
  private formatter: Intl.DateTimeFormat;
  private zoneFormatter: Intl.DateTimeFormat;

  constructor(el: HTMLElement) {
    this.el = el;
    this.formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    this.zoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      timeZoneName: 'shortOffset',
    });

    this.update();
    setInterval(() => this.update(), 60_000);
  }

  private update() {
    const now = new Date();
    const time = this.formatter.format(now);
    const zonePart = this.zoneFormatter.formatToParts(now).find(p => p.type === 'timeZoneName');
    const zone = zonePart?.value ?? 'GMT+5:45';

    this.el.textContent = `Kathmandu, Nepal · ${time} · ${zone}`;
    this.el.dateTime = now.toISOString();
  }
}

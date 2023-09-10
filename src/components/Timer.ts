export class Timer {
  private interval: number;
  private callback = (time: number) => {};

  private timer: number | undefined;
  private time: number = 0;

  constructor(interval: number = 10) {
    this.interval = interval;
  }

  get isRunning() {
    return this.timer !== undefined;
  }

  start() {
    this.timer = window.setInterval(() => {
      this.time += this.interval;
      this.callback(this.time);
    }, this.interval);
  }

  stop() {
    window.clearInterval(this.timer);
  }

  onTick(callback: (time: number) => void) {
    this.callback = callback;
  }
}

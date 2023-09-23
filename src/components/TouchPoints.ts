import { TouchEvent } from './types';

export class TouchEventsList {
  constructor(maxSize: number) {
    this._maxSize = maxSize;
    this._events = new Array<TouchEvent>(maxSize).fill({
      x: 0,
      y: 0,
      timeMs: Number.MAX_SAFE_INTEGER,
    });
  }

  _events: TouchEvent[];
  _maxSize: number;
  _cursor: number = 0;

  add(event: TouchEvent) {
    this.events[this._cursor] = event;
    this._cursor = (this._cursor + 1) % this._maxSize;
  }

  get latestEvent() {
    return {
      event: this._events[this._cursor - 1],
      index: this._cursor,
    };
  }

  get maxSize() {
    return this._maxSize;
  }

  get events() {
    return this._events;
  }
}

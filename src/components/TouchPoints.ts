import { SurfaceTouchEvent } from './types';

export class TouchEventsList {
  constructor(maxSize: number) {
    this._maxSize = maxSize;
    this._events = new Array<SurfaceTouchEvent>(maxSize).fill({
      x: 0,
      y: 0,
      timeMs: Number.MAX_SAFE_INTEGER,
    });
  }

  _events: SurfaceTouchEvent[];
  _maxSize: number;
  _cursor: number = 0;

  add(point: SurfaceTouchEvent) {
    this.events[this._cursor] = point;
    this._cursor = (this._cursor + 1) % this._maxSize;
  }

  get maxSize() {
    return this._maxSize;
  }

  get events() {
    return this._events;
  }
}

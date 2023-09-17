import { SurfaceTouchEvent } from './types';

export class TouchEventsList {
  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.events = new Array<SurfaceTouchEvent>(this.maxSize).fill({
      x: 0,
      y: 0,
      time: Number.MAX_SAFE_INTEGER,
    });
  }

  events: SurfaceTouchEvent[];
  maxSize: number;
  cursor: number = 0;

  add(point: SurfaceTouchEvent) {
    this.events[this.cursor] = point;
    this.cursor = (this.cursor + 1) % this.maxSize;
  }

  getData() {
    return new Float32Array(
      this.events.flatMap(({ x, y, time }) => [x, y, time])
    );
  }
}

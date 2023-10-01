import { Destroyable } from './types';

export class ScrollManager implements Destroyable {
  constructor(element: HTMLElement, initialOffsetY: number) {
    this._element = element;
    this._offsetY = initialOffsetY;
    this._touchStartOffsetY = initialOffsetY;

    this._element.addEventListener('touchstart', this.handleTouchStart);
    this._element.addEventListener('touchmove', this.handleTouchMove);
    this._element.addEventListener('touchend', this.handleTouchEnd);
  }

  private _element: HTMLElement;
  private _offsetY = 0;
  private _touchStartOffsetY = 0;
  private _touchStartY = 0;
  private _scrollTouchId: number | undefined;
  private _scrollCallback: ((offsetY: number) => void) | undefined;

  private handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();

    if (!this._scrollTouchId) {
      const [firstTouch] = event.touches;
      this._scrollTouchId = firstTouch.identifier;
      this._touchStartY = firstTouch.clientY;
      this._touchStartOffsetY = this._offsetY;
    }
  };

  private handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();

    const scrollTouch = this.findScrollTouch(event);
    if (!scrollTouch) return;

    const touchDeltaY = scrollTouch.clientY - this._touchStartY;
    const offsetY = this._touchStartOffsetY - touchDeltaY;
    this._offsetY = offsetY;
    this._scrollCallback?.(offsetY);
  };

  private handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();

    this._scrollTouchId = undefined;
    this._touchStartY = 0;
    this._touchStartOffsetY = this._offsetY;
  };

  private findScrollTouch(event: TouchEvent) {
    for (const touch of event.touches) {
      if (touch.identifier === this._scrollTouchId) {
        return touch;
      }
    }
  }

  public get offsetY() {
    return this._offsetY;
  }

  public onScroll(callback: (offsetY: number) => void) {
    this._scrollCallback = callback;
  }

  public destroy() {
    this._element.removeEventListener('touchstart', this.handleTouchStart);
    this._element.removeEventListener('touchmove', this.handleTouchMove);
    this._element.removeEventListener('touchend', this.handleTouchEnd);
  }
}

import { Component } from './Component';
import { Scene } from './Scene';
import { ScrollManager } from './ScrollManager';

export class Root extends Component {
  container: HTMLElement | undefined;
  scene: Scene | undefined;
  scrollManager: ScrollManager | undefined;

  constructor() {
    super();
  }

  override mount() {
    this.container = document.createElement('div');
    this.container.setAttribute('id', 'container');
    this.scrollManager = new ScrollManager(this.container, 0);

    this.container.addEventListener('touchstart', (event) => {
      for (const touch of event.touches) {
        this.scene?.addTouchEvent({
          x: touch.clientX,
          y: touch.clientY,
        });
      }
    });

    this.scrollManager.onScroll((offsetY) => {
      this.scene?.update({
        offsetY,
      });
    });

    const canvasSize = Math.max(window.innerWidth, window.innerHeight);
    this.scene = new Scene({
      offsetY: 0,
      resolution: {
        width: canvasSize,
        height: canvasSize,
      },
    });

    this.container.appendChild(this.scene.mount());

    return this.container;
  }

  override unmount() {
    this.scrollManager?.destroy();
    this.scene?.unmount();
  }
}

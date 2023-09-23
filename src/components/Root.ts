import { Component } from './Component';
import { Scene } from './Scene';
import { Timer } from './Timer';

export class Root extends Component {
  container: HTMLElement | undefined;
  scene: Scene | undefined;
  timer: Timer | undefined;

  constructor() {
    super();
  }

  private updateMousePosition = (event: MouseEvent) => {
    if (!this.timer) throw new Error('Timer not initialized');
    if (!this.scene) throw new Error('Scene not initialized');

    this.scene.addTouchEvent({
      x: event.clientX,
      y: event.clientY,
    });
  };

  override mount() {
    this.container = document.createElement('div');
    this.container.setAttribute('id', 'container');
    this.container.addEventListener('mousedown', this.updateMousePosition);

    this.timer = new Timer(1_000 / 60);
    this.timer.onTick((time) => {
      this.scene?.update({ progress: time / 20 });
    });
    this.timer.start();

    const canvasSize = Math.max(window.innerWidth, window.innerHeight);
    this.scene = new Scene({
      progress: 0,
      resolution: {
        width: canvasSize,
        height: canvasSize,
      },
    });

    this.container.appendChild(this.scene.mount());

    return this.container;
  }

  override unmount() {
    this.container?.removeEventListener('mousedown', this.updateMousePosition);
    this.timer?.stop();
    this.scene?.unmount();
  }
}

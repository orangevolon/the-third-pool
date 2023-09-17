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

    this.scene?.update({
      touchEvent: {
        x: event.clientX,
        y: event.clientY,
        time: this.timer?.currentTime,
      },
    });
  };

  override mount() {
    this.container = document.createElement('div');
    this.container.setAttribute('id', 'container');
    this.container.addEventListener('mousedown', this.updateMousePosition);

    this.timer = new Timer(1_000 / 60);
    this.timer.onTick((time) => {
      this.scene?.update({ time });
    });

    const canvasSize = Math.max(window.innerWidth, window.innerHeight);
    this.scene = new Scene({
      width: canvasSize,
      height: canvasSize,
      time: 0,
    });

    this.container.appendChild(this.scene.mount());

    return this.container;
  }

  override unmount() {
    this.container?.removeEventListener('mousedown', this.updateMousePosition);
    this.timer?.stop();

    this.scene?.unmount();
  }

  override render() {
    if (this.timer && !this.timer.isRunning) {
      this.timer.start();
    }

    this.scene?.render();
  }
}

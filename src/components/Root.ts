import { Component } from './Component';
import { Scene } from './Scene';
import { Timer } from './Timer';

export class Root extends Component {
  container: HTMLElement | undefined;
  scene: Scene | undefined;
  timer: Timer | undefined;
  progressTimer: Timer | undefined;

  constructor() {
    super();
  }

  private updateMousePosition = (event: MouseEvent) => {
    if (!this.timer) throw new Error('Timer not initialized');
    if (!this.scene) throw new Error('Scene not initialized');

    this.scene.addTouchEvent({
      x: event.clientX,
      y: event.clientY,
      timeMs: this.timer.currentTime,
    })
  };

  override mount() {
    this.container = document.createElement('div');
    this.container.setAttribute('id', 'container');
    this.container.addEventListener('mousedown', this.updateMousePosition);

    this.timer = new Timer(1_000 / 60);
    this.timer.onTick((time) => {
      this.scene?.update({ time });
    });

    this.progressTimer = new Timer(1_000 / 60);
    this.progressTimer.onTick((time) => {
      this.scene?.update({ progress: time / 50_000 });
    });

    const canvasSize = Math.max(window.innerWidth, window.innerHeight);
    this.scene = new Scene({
      width: canvasSize,
      height: canvasSize,
      progress: 0,
      time: 0,
    });

    this.container.appendChild(this.scene.mount());

    return this.container;
  }

  override unmount() {
    this.container?.removeEventListener('mousedown', this.updateMousePosition);
    this.timer?.stop();
    this.progressTimer?.stop();

    this.scene?.unmount();
  }

  override render() {
    if (this.timer && !this.timer.isRunning) {
      this.timer.start();
      this.progressTimer?.start();
    }

    this.scene?.render();
  }
}

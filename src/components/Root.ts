import { Component } from './Component';
import { Scene } from './Scene';

export class Root extends Component {
  container: HTMLElement | undefined;
  scene: Scene | undefined;

  override mount() {
    this.container = document.createElement('div');
    this.container.setAttribute('id', 'container');

    const canvasSize = Math.max(window.innerWidth, window.innerHeight);
    this.scene = new Scene({
      width: canvasSize,
      height: canvasSize,
    });

    this.container.appendChild(this.scene.mount());

    return this.container;
  }

  override unmount() {
    this.scene?.unmount();
  }

  override render() {
    this.scene?.render();
  }
}

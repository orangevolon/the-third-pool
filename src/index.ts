import { Scene } from './components/Scene';
import './index.css'

function main() {
  const app = document.getElementById('app');

  if (!app) {
    throw new Error('No app element found');
  }

  const scene = Scene({
    width: 500,
    height: 500,
  });
  app.appendChild(scene.element);

  scene.onMount();
}

main();

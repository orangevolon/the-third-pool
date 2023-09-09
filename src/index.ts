import { Scene } from './components/Scene';

function main() {
  const app = document.getElementById('app');

  if (!app) {
    throw new Error('No app element found');
  }

  const scene = Scene();
  app.appendChild(scene.element);

  scene.onMount();
}

main();

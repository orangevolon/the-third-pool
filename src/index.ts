import { Canvas } from './Canvas';

function main() {
  const app = document.getElementById('app');

  if (!app) {
    throw new Error('No app element found');
  }

  app.appendChild(Canvas());
}

main();

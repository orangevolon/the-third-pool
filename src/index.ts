import { Scene } from './components/Scene';

function main() {
  const app = document.getElementById('app');

  if (!app) {
    throw new Error('No app element found');
  }

  app.appendChild(Scene());
}

main();

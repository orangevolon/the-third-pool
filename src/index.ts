import './index.css';
import { Root } from './components/Root';

const app = document.getElementById('app');

if (!app) {
  throw new Error('No app element found');
}

const root = Root();
app.appendChild(root.element);

root.onMount?.();

import './index.css';
import { Root } from './components/Root';

const app = document.getElementById('app');

if (!app) {
  throw new Error('No app element found');
}

const root = new Root();
app.appendChild(root.mount());

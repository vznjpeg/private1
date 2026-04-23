import { defineUnlistedScript } from 'wxt/sandbox';
import { createRoot } from 'react-dom/client';
import App from './popup/app';
import './popup/popup.css';

export default defineUnlistedScript(() => {
  const container = document.getElementById('app');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});

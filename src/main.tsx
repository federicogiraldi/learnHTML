import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { listenForInstallPrompt } from './pwa/install';
import { requestPersistentStorage } from './store/persistence';
import './styles.css';

listenForInstallPrompt();
void requestPersistentStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

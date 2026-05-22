import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ArduinoProvider } from './ArduinoContext';
import './index.css';

console.log("[Doctorian] Neural Interface Initializing...");
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArduinoProvider>
      <App />
    </ArduinoProvider>
  </StrictMode>,
);

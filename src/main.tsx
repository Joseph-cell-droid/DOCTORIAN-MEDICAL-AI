import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App, { ErrorBoundary } from './App';
import { ArduinoProvider } from './ArduinoContext';
import './index.css';

console.log("[Doctorian] Neural Interface Initializing...");
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ArduinoProvider>
        <App />
      </ArduinoProvider>
    </ErrorBoundary>
  </StrictMode>,
);


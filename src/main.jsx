import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n'; // Import this before your App
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
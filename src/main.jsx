import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/auth.css'; // глобальний стиль для auth екранів

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
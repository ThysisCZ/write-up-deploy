// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/auth.css'; // глобальний стиль для auth екранів
import './styles/post-auth.css'; // import styles for post-auth elements
import FetchHelper from './fetchHelper';

// -----------------------
// Очистка localStorage при старті (контрольовано через .env)
// -----------------------
if (import.meta.env.VITE_CLEAR_MYBOOKS === "1") {
  try {
    localStorage.removeItem("mybooks");
    // Ставимо невеликий лог, щоб було видно в консолі браузера:
    console.log("[init] cleared mybooks from localStorage (VITE_CLEAR_MYBOOKS=1)");
  } catch (e) {
    console.warn("[init] failed to clear mybooks:", e);
  }
}
// -----------------------


// Refresh token if already logged in before
const refreshToken = localStorage.getItem("refreshToken")
const accessToken = localStorage.getItem("accessToken")

/*
if (refreshToken && accessToken) {
    const refreshTokenResult = await FetchHelper.user.refresh({}, refreshToken)
    console.log(refreshTokenResult)
    if (refreshTokenResult.ok) {
        localStorage.setItem("accessToken",refreshTokenResult.response.accessToken)
    }
}*/


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
import React, { useEffect } from 'react';
import LogoCard from './LogoCard';

export default function WelcomeScreen({ onGetStarted = () => { }, onLogin = () => { }, navToInstantly }) {


  const accessToken = localStorage.getItem("accessToken") ?? false;

  useEffect(
    () => {if (accessToken) {
      navToInstantly("/home")
    }}, [ accessToken ]
  )
  

  return (
    <div className="auth-root">
      <div className="auth-container">
        <LogoCard />
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Write. Share. Grow.</p>

        <button className="cta" onClick={onGetStarted}>
          <span className="cta-text">Get Started</span>
        </button>

        <button className="link" onClick={onLogin}>Already have an account? Log in</button>
      </div>
    </div>
  );
}
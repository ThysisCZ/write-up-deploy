import React from 'react';
import LogoCard from './LogoCard';

export default function LoginScreen({ onSignUp = () => {} }) {
  return (
    <div className="auth-root">
      <div className="auth-container">
        <LogoCard />
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Log in to your account</p>

        <input className="input" placeholder="Email" />
        <input className="input" type="password" placeholder="Password" />

        <button className="cta">Log In</button>
        <button className="link" onClick={onSignUp}>Don’t have an account? Sign up</button>
      </div>
    </div>
  );
}
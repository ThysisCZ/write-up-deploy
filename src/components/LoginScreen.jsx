import { React, useState } from 'react';
import LogoCard from './LogoCard';
import { ClipLoader } from "react-spinners";

export default function LoginScreen({ onSignUp = () => { }, onLoginSuccess = () => { } }) {
  const [loginCall, setLoginCall] = useState({ state: "inactive" });

  const handleLogin = () => {
    // TODO: when backend ready -> fetch('/auth/login', {method:'POST', body: JSON.stringify({email,password})})
    // temporary: simulate loading and success

    setLoginCall({ state: "pending" });

    setTimeout(() => {
      setLoginCall({ state: "success" });
      onLoginSuccess();
    }, 2000);
  }

  return (
    <div className="auth-root">
      <div className="auth-container auth-container-login">
        <div>
          <LogoCard />
        </div>
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Log in to your account</p>
        <input className="input" placeholder="Email" />
        <input className="input" type="password" placeholder="Password" />

        <button className="cta" onClick={handleLogin} style={{ marginTop: 18 }}>{
          loginCall.state === "pending" ?
            <ClipLoader color="white" size={20} /> : "Log in"
        }
        </button>

        <button className="link" onClick={onSignUp}>Don’t have an account? Sign up</button>
      </div>
    </div>
  );
}
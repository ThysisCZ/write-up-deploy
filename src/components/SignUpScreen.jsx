import React, { useState } from 'react';
import LogoCard from './LogoCard';
import { ClipLoader } from "react-spinners";

export default function SignUpScreen({ onLogin = () => { }, onRegisterSuccess = () => { } }) {
  const [isAuthor, setIsAuthor] = useState(false);
  const [registerCall, setRegisterCall] = useState({ state: "inactive" });

  const handleRegister = () => {
    // TODO: when backend ready -> fetch('/auth/login', {method:'POST', body: JSON.stringify({email,password})})
    // temporary: simulate loading and success

    setRegisterCall({ state: "pending" });

    setTimeout(() => {
      setRegisterCall({ state: "success" });
      onRegisterSuccess();
    }, 2000);
  }

  return (
    <div className="auth-root">
      <div className={`auth-container auth-container-signup ${isAuthor ? 'author-mode' : ''}`} >
        <LogoCard />
        <h1 className="title">Welcome</h1>
        <p className="subtitle">Sign up to get started</p>

        <input className="input" placeholder="Username" />
        <input className="input" placeholder="Email" />
        <input className="input" type="password" placeholder="Password" />

        <div className="checkbox-row" onClick={() => setIsAuthor(!isAuthor)} style={{ cursor: 'pointer' }}>
          <div className={`checkbox ${isAuthor ? 'checked' : ''}`}>{isAuthor && <div className="tick" />}</div>
          <div style={{ color: '#fff' }}>I want to be an author</div>
        </div>

        {isAuthor && (
          <>
            <div className="small-label">Author biography</div>
            <textarea className="input textarea" placeholder="Short biography (min 20 characters)" />

            <div className="small-label">Genres (comma separated)</div>
            <input className="input" placeholder="e.g. Fantasy, Sci-fi, Drama" />
            <div className="note">Separate multiple genres with commas. At least one genre is recommended.</div>
          </>
        )}

        <button className="cta" onClick={handleRegister} style={{ marginTop: 18 }}>{
          registerCall.state === "pending" ?
            <ClipLoader color="white" size={20} /> : "Sign up"
        }
        </button>

        <button className="link" onClick={onLogin}>Already have an account? Log in</button>
      </div>
    </div>
  );
}
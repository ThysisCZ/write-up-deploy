import React, { useState } from 'react';
import LogoCard from './LogoCard';

export default function SignUpScreen({ onLogin = () => {} }) {
  const [isAuthor, setIsAuthor] = useState(false);

  return (
    <div className="auth-root">
      <div className="auth-container">
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

        <button className="cta" style={{ marginTop: 18 }}>Sign up</button>
        <button className="link" onClick={onLogin}>Already have an account? Log in</button>
      </div>
    </div>
  );
}
// src/components/ProfileScreen.jsx
import React from 'react';

export default function ProfileScreen({ setScreen = () => {} }) {
  // При потребі підключіть додаткові пропси: user, onEdit, onLogout тощо.
  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h1 style={{ marginTop: 0 }}>Profile</h1>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, margin: '6px 0' }}>User</h2>
        <div style={{
          background: 'rgba(10,36,56,0.45)',
          padding: 12,
          borderRadius: 12,
          maxWidth: 520
        }}>
          <div style={{ fontWeight: 700 }}>Your username</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>jk.rowling@gmail.com</div>
        </div>
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, margin: '6px 0' }}>About</h2>
        <div style={{
          background: 'rgba(10,36,56,0.45)',
          padding: 12,
          borderRadius: 12,
          maxWidth: 520,
          lineHeight: 1.4,
          color: 'rgba(255,255,255,0.9)'
        }}>
          Тут буде інформація про користувача. Коротка біографія, жанри, інші деталі.
        </div>
      </section>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setScreen('/home')}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            background: '#0b3b5a',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Back
        </button>

        <button
          onClick={() => alert('Edit profile — реалізувати тут')}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Edit profile
        </button>
      </div>
    </div>
  );
}
import React from 'react';

export default function LogoCard({ size = 96 }) {
  const logoUrl = '/logo.png'; // помістіть логотип у public/logo.png

  return (
    <div
      className="logo-card"
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        background: '#f6f7f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        boxShadow: '0 12px 28px rgba(0,0,0,0.28)'
      }}
    >
      <img src={logoUrl} alt="WriteUp logo" style={{ width: 56, height: 56, objectFit: 'contain' }} />
    </div>
  );
}
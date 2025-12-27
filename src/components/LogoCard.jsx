import React from 'react';

export default function LogoCard() {
  const logoUrl = '/logo.png'; // помістіть логотип у public/logo.png

  return (
    <div
      className="logo-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18
      }}
    >
      <img src={logoUrl} alt="WriteUp logo" style={{
        width: 96, height: 96, objectFit: 'contain',
        borderRadius: 16, boxShadow: '0 12px 28px rgba(0,0,0,0.28)'
      }} />
    </div>
  );
}
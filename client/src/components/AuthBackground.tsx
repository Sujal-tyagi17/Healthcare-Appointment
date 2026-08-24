import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="auth-background" aria-hidden="true">
      {/* Ambient lighting */}
      <div className="auth-glow auth-glow-blue" />
      <div className="auth-glow auth-glow-purple" />
      <div className="auth-glow auth-glow-cyan" />

      {/* Subtle dot texture */}
      <div className="auth-dots" />

      {/* Edge darkening */}
      <div className="auth-vignette" />
    </div>
  );
};

export default AuthBackground;

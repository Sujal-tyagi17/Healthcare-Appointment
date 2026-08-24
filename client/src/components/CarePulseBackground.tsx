import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const CarePulseBackground: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`carepulse-bg ${isDark ? 'dark-bg' : 'light-bg'}`} aria-hidden="true">
      {/* Ambient Gradient Glows */}
      <div className="bg-glow bg-glow-blue" />
      <div className="bg-glow bg-glow-purple" />
      <div className="bg-glow bg-glow-cyan" />

      {/* Cyber Grid & Dot Matrix */}
      <div className="bg-grid" />
      <div className="bg-dots" />

      {/* Animated Clinical ECG Heartbeat Pulse */}
      <svg
        className="bg-ecg"
        viewBox="0 0 1600 300"
        preserveAspectRatio="none"
      >
        <path
          className="ecg-path"
          d="
            M0 160
            L180 160
            L200 155 L210 160
            L230 160
            L240 175
            L255 40
            L270 210
            L280 160
            L300 160
            L320 145 L340 160
            L500 160
            L680 160
            L700 155 L710 160
            L730 160
            L740 175
            L755 40
            L770 210
            L780 160
            L800 160
            L820 145 L840 160
            L1000 160
            L1180 160
            L1200 155 L1210 160
            L1230 160
            L1240 175
            L1255 40
            L1270 210
            L1280 160
            L1300 160
            L1320 145 L1340 160
            L1600 160
          "
        />
      </svg>

      {/* Floating Ambient Bio-Particles */}
      <div className="bg-particles">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* Radial Vignette */}
      <div className="bg-vignette" />
    </div>
  );
};

export default CarePulseBackground;

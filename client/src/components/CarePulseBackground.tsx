import React from 'react';

export const CarePulseBackground: React.FC = () => {
  return (
    <div className="carepulse-bg" aria-hidden="true">
      {/* Ambient Lighting Glows */}
      <div className="bg-glow bg-glow-blue" />
      <div className="bg-glow bg-glow-purple" />
      <div className="bg-glow bg-glow-cyan" />

      {/* Cyber Medical Precision Grid & Dot Matrix */}
      <div className="bg-grid" />
      <div className="bg-dots" />

      {/* Dynamic Animated Clinical ECG Heartbeat Pulse Line */}
      <svg
        className="bg-ecg"
        viewBox="0 0 1600 300"
        preserveAspectRatio="none"
      >
        <path
          className="ecg-path"
          d="
            M 0 150
            L 150 150
            L 170 145 L 180 150
            L 200 150
            L 210 165
            L 225 30
            L 240 210
            L 250 150
            L 270 150
            L 290 135 L 310 150
            L 450 150
            L 550 150
            L 570 145 L 580 150
            L 600 150
            L 610 165
            L 625 30
            L 640 210
            L 650 150
            L 670 150
            L 690 135 L 710 150
            L 850 150
            L 950 150
            L 970 145 L 980 150
            L 1000 150
            L 1010 165
            L 1025 30
            L 1040 210
            L 1050 150
            L 1070 150
            L 1090 135 L 1110 150
            L 1250 150
            L 1350 150
            L 1370 145 L 1380 150
            L 1400 150
            L 1410 165
            L 1425 30
            L 1440 210
            L 1450 150
            L 1470 150
            L 1490 135 L 1510 150
            L 1600 150
          "
        />
      </svg>

      {/* Floating Ambient Bio-Data Particles */}
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

      {/* Soft Depth Vignette */}
      <div className="bg-vignette" />
    </div>
  );
};

export default CarePulseBackground;

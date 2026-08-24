import React from 'react';

export const CarePulseBackground: React.FC = () => {
  return (
    <div className="carepulse-bg" aria-hidden="true">
      <div className="bg-glow bg-glow-blue" />
      <div className="bg-glow bg-glow-purple" />
      <div className="bg-glow bg-glow-cyan" />

      <div className="bg-grid" />
      <div className="bg-dots" />

      <svg
        className="bg-ecg"
        viewBox="0 0 1600 300"
        preserveAspectRatio="none"
      >
        <path
          d="
            M0 160
            L180 160
            L220 160
            L245 158
            L265 160
            L285 160
            L300 160
            L315 160
            L330 160
            L345 160
            L360 160
            L375 160
            L390 160
            L405 160
            L420 160
            L435 160
            L450 160
            L465 160
            L480 160
            L495 160
            L510 160
            L525 160
            L540 160
            L555 160
            L570 160
            L585 160
            L600 160
            L615 160
            L630 160
            L645 160
            L660 160
            L675 160
            L690 160
            L705 160
            L720 160
            L735 160
            L750 160
            L765 160
            L780 160
            L795 160
            L810 160
            L825 160
            L840 160
            L855 160
            L870 160
            L885 160
            L900 160
            L915 160
            L930 160
            L945 160
            L960 160
            L975 160
            L990 160
            L1005 160
            L1020 160
            L1035 160
            L1050 160
            L1065 160
            L1080 160
            L1095 160
            L1110 160
            L1125 160
            L1140 160
            L1155 160
            L1170 160
            L1185 160
            L1200 160
            L1215 160
            L1230 160
            L1245 160
            L1260 160
            L1275 160
            L1290 160
            L1305 160
            L1320 160
            L1335 160
            L1350 160
            L1365 160
            L1380 160
            L1395 160
            L1410 160
            L1425 160
            L1440 160
            L1455 160
            L1470 160
            L1485 160
            L1500 160
            L1600 160
          "
        />
      </svg>

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

      <div className="bg-vignette" />
    </div>
  );
};

export default CarePulseBackground;

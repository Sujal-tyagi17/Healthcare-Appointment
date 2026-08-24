import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export const FluidShaderCanvas: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={`fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#070e1e]' : 'bg-[#f8fafc]'
      }`}
    >
      {/* Dynamic Animated Ambient Aurora Orbs */}
      <div
        className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] animate-pulse transition-all duration-1000 ${
          isDark
            ? 'bg-gradient-to-br from-primary/20 to-blue-600/10'
            : 'bg-gradient-to-br from-sky-400/20 to-blue-500/15'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full blur-[160px] animate-pulse transition-all duration-1000 ${
          isDark
            ? 'bg-gradient-to-bl from-secondary/15 to-indigo-600/10'
            : 'bg-gradient-to-bl from-indigo-300/20 to-purple-300/15'
        }`}
        style={{ animationDelay: '2s' }}
      />
      <div
        className={`absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] animate-pulse transition-all duration-1000 ${
          isDark
            ? 'bg-gradient-to-tr from-cyan-500/15 to-primary/10'
            : 'bg-gradient-to-tr from-teal-300/15 to-sky-300/20'
        }`}
        style={{ animationDelay: '4s' }}
      />

      {/* Interactive Cursor Reactive Glow Aura */}
      <div
        className={`absolute w-[450px] h-[450px] rounded-full blur-[80px] transition-transform duration-300 ease-out ${
          isDark
            ? 'bg-radial from-primary/15 via-secondary/5 to-transparent'
            : 'bg-radial from-sky-400/15 via-indigo-300/10 to-transparent'
        }`}
        style={{
          transform: `translate(${mousePos.x - 225}px, ${mousePos.y - 225}px)`,
          willChange: 'transform'
        }}
      />

      {/* Subtle Precision Grid Dot-Matrix Texture */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDark ? 'opacity-[0.07]' : 'opacity-[0.12]'
        }`}
        style={{
          backgroundImage: isDark
            ? `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`
            : `radial-gradient(rgba(15, 23, 42, 0.3) 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />
    </div>
  );
};

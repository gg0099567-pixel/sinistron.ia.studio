import React from 'react';

interface SinistronLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | number;
  showText?: boolean;
  textColor?: string;
  variant?: 'full' | 'icon' | 'stacked' | 'horizontal';
  className?: string;
  glow?: boolean;
  animated?: boolean;
  continuousSpin?: boolean;
}

export const SinistronLogo: React.FC<SinistronLogoProps> = ({
  size = 'md',
  showText = true,
  textColor,
  variant = 'horizontal',
  className = '',
  glow = false,
  animated = false,
  continuousSpin = false,
}) => {
  // Dimension mapping
  const sizeMap = {
    xs: 20,
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
    hero: 120,
  };

  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 36;
  const uniqueId = React.useId().replace(/:/g, '_');

  const emblem = (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${animated ? 'group' : ''}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Background glow if enabled */}
      {glow && (
        <div
          className={`absolute inset-0 rounded-full blur-xl opacity-70 pointer-events-none transition-all duration-700 ${
            continuousSpin ? 'animate-pulse' : 'group-hover:opacity-100 group-hover:scale-125'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(217,70,239,0.6) 0%, rgba(139,92,246,0.45) 45%, rgba(15,5,24,0) 75%)',
          }}
        />
      )}

      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full relative z-10 transition-transform duration-700 ${
          continuousSpin
            ? 'sinistron-spin-slow'
            : animated
            ? 'hover:rotate-12 hover:scale-105'
            : ''
        }`}
      >
        <defs>
          {/* Main Petal Gradient 1 - Fuchsia to Violet */}
          <linearGradient id={`sinistron_g1_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="30%" stopColor="#d946ef" />
            <stop offset="70%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          {/* Complementary Petal Gradient 2 - Deep Violet to Rose */}
          <linearGradient id={`sinistron_g2_${uniqueId}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="40%" stopColor="#a855f7" />
            <stop offset="85%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>

          {/* Accent Inner Gradient 3 */}
          <linearGradient id={`sinistron_g3_${uniqueId}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4338ca" stopOpacity="0.95" />
          </linearGradient>

          {/* Radial Center Glow */}
          <radialGradient id={`sinistron_rg_${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0f0518" stopOpacity="0" />
          </radialGradient>

          {/* Filter for subtle drop glow */}
          <filter id={`sinistron_glow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Center ambient aura */}
        <circle cx="100" cy="100" r="75" fill={`url(#sinistron_rg_${uniqueId})`} />

        {/* 4 Rotational Vortex Petals / Blades */}
        <g filter={`url(#sinistron_glow_${uniqueId})`}>
          {/* Petal 1 - Top Right */}
          <path
            d="M 100,20 C 135,20 168,45 175,80 C 160,70 142,68 128,75 C 112,83 105,98 100,110 C 95,92 88,72 82,56 C 88,38 94,24 100,20 Z"
            fill={`url(#sinistron_g1_${uniqueId})`}
            opacity="0.92"
          />
          <path
            d="M 100,20 C 122,20 148,32 162,54 C 145,60 130,72 120,86 C 110,70 102,46 100,20 Z"
            fill={`url(#sinistron_g2_${uniqueId})`}
            opacity="0.8"
          />

          {/* Petal 2 - Bottom Right (Rotated 90) */}
          <path
            d="M 180,100 C 180,135 155,168 120,175 C 130,160 132,142 125,128 C 117,112 102,105 90,100 C 108,95 128,88 144,82 C 162,88 176,94 180,100 Z"
            fill={`url(#sinistron_g1_${uniqueId})`}
            opacity="0.92"
          />
          <path
            d="M 180,100 C 180,122 168,148 146,162 C 140,145 128,130 114,120 C 130,110 154,102 180,100 Z"
            fill={`url(#sinistron_g2_${uniqueId})`}
            opacity="0.8"
          />

          {/* Petal 3 - Bottom Left (Rotated 180) */}
          <path
            d="M 100,180 C 65,180 32,155 25,120 C 40,130 58,132 72,125 C 88,117 95,102 100,90 C 105,108 112,128 118,144 C 112,162 106,176 100,180 Z"
            fill={`url(#sinistron_g1_${uniqueId})`}
            opacity="0.92"
          />
          <path
            d="M 100,180 C 78,180 52,168 38,146 C 55,140 70,128 80,114 C 90,130 98,154 100,180 Z"
            fill={`url(#sinistron_g2_${uniqueId})`}
            opacity="0.8"
          />

          {/* Petal 4 - Top Left (Rotated 270) */}
          <path
            d="M 20,100 C 20,65 45,32 80,25 C 70,40 68,58 75,72 C 83,88 98,95 110,100 C 92,105 72,112 56,118 C 38,112 24,106 20,100 Z"
            fill={`url(#sinistron_g1_${uniqueId})`}
            opacity="0.92"
          />
          <path
            d="M 20,100 C 20,78 32,52 54,38 C 60,55 72,70 86,80 C 70,90 46,98 20,100 Z"
            fill={`url(#sinistron_g2_${uniqueId})`}
            opacity="0.8"
          />

          {/* Dynamic Swirling Intersecting Center Elements */}
          <path
            d="M 100,60 C 115,75 125,95 115,115 C 95,125 75,115 60,100 C 75,85 85,65 100,60 Z"
            fill={`url(#sinistron_g3_${uniqueId})`}
            opacity="0.75"
          />
          <path
            d="M 140,100 C 125,115 105,125 85,115 C 75,95 85,75 100,60 C 115,75 135,85 140,100 Z"
            fill={`url(#sinistron_g2_${uniqueId})`}
            opacity="0.65"
          />

          {/* Center Pinwheel Core Vortex */}
          <circle cx="100" cy="100" r="14" fill="#0f0518" opacity="0.95" />
          <circle cx="100" cy="100" r="11" fill={`url(#sinistron_g1_${uniqueId})`} opacity="0.8" />
          <circle cx="100" cy="100" r="5" fill="#ffffff" opacity="0.9" />
        </g>
      </svg>
    </div>
  );

  if (variant === 'icon' || !showText) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {emblem}
      </div>
    );
  }

  // Text sizing proportional to emblem size
  const getTextClasses = () => {
    if (pixelSize <= 24) return 'text-sm tracking-wider font-extrabold';
    if (pixelSize <= 32) return 'text-base tracking-widest font-extrabold';
    if (pixelSize <= 48) return 'text-xl tracking-[0.18em] font-black';
    if (pixelSize <= 70) return 'text-2xl tracking-[0.2em] font-black';
    return 'text-4xl sm:text-5xl tracking-[0.22em] font-black';
  };

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center justify-center text-center gap-3 ${className}`}>
        {emblem}
        <div className="flex flex-col items-center">
          <div className={`font-mono uppercase font-black ${getTextClasses()}`}>
            <span className={textColor || 'text-white'}>SINISTRON</span>
            <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              .IA
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 mt-1">
            Gestão Inteligente & Metas
          </span>
        </div>
      </div>
    );
  }

  // Default horizontal variant
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {emblem}
      <div className="flex items-center">
        <span className={`font-mono uppercase font-extrabold tracking-wider ${getTextClasses()}`}>
          <span className={textColor || 'text-inherit'}>SINISTRON</span>
          <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            .IA
          </span>
        </span>
      </div>
    </div>
  );
};

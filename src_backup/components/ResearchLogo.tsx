import React from 'react';

interface ResearchLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const ResearchLogo: React.FC<ResearchLogoProps> = ({
  className = '',
  size = 24,
  glow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Research"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full text-primary transition-all duration-300 ${
          glow ? 'filter drop-shadow-[0_0_8px_rgba(76,214,251,0.55)]' : ''
        }`}
      >
        <defs>
          <linearGradient id="research-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4cd6fb" />
            <stop offset="0.6" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Outer orbital telemetry circle */}
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="url(#research-grad)"
          strokeWidth="1.3"
          strokeDasharray="3.5 2.5"
          className="opacity-60"
        />

        {/* Cardinal precision alignment ticks */}
        <path
          d="M12 1.5V4M12 20V22.5M1.5 12H4M20 12H22.5"
          stroke="url(#research-grad)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />

        {/* Concentric analytical focus ring */}
        <circle
          cx="12"
          cy="12"
          r="6"
          stroke="url(#research-grad)"
          strokeWidth="1.6"
          className="opacity-95"
        />

        {/* Central 4-point discovery star / research prism nucleus */}
        <path
          d="M12 7.2C12 9.5 13.6 11.2 16 12C13.6 12.8 12 14.5 12 16.8C12 14.5 10.4 12.8 8 12C10.4 11.2 12 9.5 12 7.2Z"
          fill="url(#research-grad)"
        />

        {/* Inner pupil focus point */}
        <circle cx="12" cy="12" r="1.3" fill="#0d1117" />
      </svg>
    </div>
  );
};

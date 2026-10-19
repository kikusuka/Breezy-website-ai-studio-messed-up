import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
  glow?: boolean;
}

export function Icon({ name, className = '', fill = false, glow = false }: IconProps) {
  const glowClass = glow ? 'neon-glow' : '';

  if (name === 'research' || name === 'research_logo') {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center select-none ${glowClass} ${className}`.trim()}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[1em] h-[1em] current-color transition-all duration-200"
        >
          {/* Outer telemetry orbit */}
          <circle
            cx="12"
            cy="12"
            r="9.25"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeDasharray="3 2"
            className="opacity-50"
          />
          {/* Precision cardinal alignment ticks */}
          <path
            d="M12 1.5V4M12 20V22.5M1.5 12H4M20 12H22.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Concentric analytical focus ring */}
          <circle
            cx="12"
            cy="12"
            r="5.75"
            stroke="currentColor"
            strokeWidth="1.6"
            className="opacity-90"
          />
          {/* Central 4-point discovery star / research prism nucleus */}
          <path
            d="M12 7.4C12 9.5 13.5 11.2 15.6 12C13.5 12.8 12 14.5 12 16.6C12 14.5 10.5 12.8 8.4 12C10.5 11.2 12 9.5 12 7.4Z"
            fill="currentColor"
          />
          {/* Inner focal core */}
          <circle cx="12" cy="12" r="1.2" fill="#13151b" />
        </svg>
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none ${fill ? 'fill' : ''} ${glowClass} ${className}`.trim()}
    >
      {name}
    </span>
  );
}

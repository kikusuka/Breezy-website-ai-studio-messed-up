import React from 'react';

interface BreezyLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export const BreezyLogo: React.FC<BreezyLogoProps> = ({
  className = '',
  size = 32,
  showWordmark = false,
  wordmarkClassName = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Breezy Mascot Image */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <img
          src="/breezy1.png"
          alt="Breezy"
          className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(76,214,251,0.35)] transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            // Graceful fallback to svg favicon if needed
            (e.currentTarget as HTMLImageElement).src = '/favicon.svg';
          }}
        />
      </div>

      {/* Optional Wordmark Branding */}
      {showWordmark && (
        <div className={`flex flex-col text-left ${wordmarkClassName}`}>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold text-base tracking-tight text-on-surface">
              Breezy
            </span>
            <span className="px-1.5 py-0.5 rounded bg-primary/15 border border-primary/30 text-primary font-mono text-[9px] uppercase font-bold tracking-wider">
              Research
            </span>
          </div>
          <span className="font-mono text-[10px] text-outline tracking-tight mt-0.5">
            Truth-First Multi-Model Council
          </span>
        </div>
      )}
    </div>
  );
};

import { cn } from '@/lib/utils';

interface MoroccanPatternProps {
  className?: string;
  opacity?: number;
  color?: string;
}

export default function MoroccanPattern({
  className,
  opacity = 0.06,
  color = '#C9A84C',
}: MoroccanPatternProps) {
  const encoded = encodeURIComponent(color);

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern id="moroccan-star" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* 8-pointed star */}
            <path
              d="M40,8 L44,28 L60,16 L50,32 L72,30 L56,40 L72,50 L50,48 L60,64 L44,52 L40,72 L36,52 L20,64 L30,48 L8,50 L24,40 L8,30 L30,32 L20,16 L36,28 Z"
              fill={color}
              stroke={color}
              strokeWidth="0.5"
            />
            {/* Center diamond */}
            <path
              d="M40,28 L46,40 L40,52 L34,40 Z"
              fill={color}
              opacity="0.6"
            />
            {/* Corner dots */}
            <circle cx="0" cy="0" r="2" fill={color} />
            <circle cx="80" cy="0" r="2" fill={color} />
            <circle cx="0" cy="80" r="2" fill={color} />
            <circle cx="80" cy="80" r="2" fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#moroccan-star)" />
      </svg>
    </div>
  );
}

// Geometric border ornament
export function GeometricBorder({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold" />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12,2 L14,9 L21,9 L15.5,13.5 L17.5,20.5 L12,16 L6.5,20.5 L8.5,13.5 L3,9 L10,9 Z"
          fill="#C9A84C"
        />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold" />
    </div>
  );
}

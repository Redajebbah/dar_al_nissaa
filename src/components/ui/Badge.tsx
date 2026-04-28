import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'new' | 'sale' | 'outOfStock' | 'featured';
  className?: string;
}

const variants = {
  new: 'bg-emerald text-white',
  sale: 'bg-gold text-white',
  outOfStock: 'bg-gray-400 text-white',
  featured: 'bg-gradient-to-r from-gold-300 to-gold text-emerald',
};

export default function Badge({ children, variant = 'new', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

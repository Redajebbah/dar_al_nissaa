'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: string[];
  selected: string;
  onChange: (size: string) => void;
}

export default function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {sizes.map((size) => (
        <motion.button
          key={size}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(size)}
          className={cn(
            'relative w-12 h-12 rounded-xl font-semibold text-sm transition-all duration-200 border-2',
            selected === size
              ? 'bg-emerald text-white border-emerald shadow-luxury'
              : 'bg-white text-emerald border-cream-300 hover:border-emerald'
          )}
        >
          {selected === size && (
            <motion.div
              layoutId="size-indicator"
              className="absolute inset-0 bg-emerald rounded-xl"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 400 }}
            />
          )}
          {size}
        </motion.button>
      ))}
    </div>
  );
}

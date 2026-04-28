'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Globe, Search } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/collections/qmiss-jouhara', label: 'Qmiss Jouhara', labelAr: 'قميص جوهرة' },
  { href: '/collections/qmiss-ghourza', label: 'Qmiss Ghourza', labelAr: 'قميص غرزة' },
  { href: '/collections/takchita', label: 'Takchita', labelAr: 'التكشيطة' },
  { href: '/collections/qmayess-rbati', label: 'Qmayess Rbati', labelAr: 'القمايص الرباطية' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => setLang((l) => (l === 'fr' ? 'ar' : 'fr'));

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
          scrolled
            ? 'bg-cream/95 backdrop-blur-md shadow-luxury'
            : 'bg-transparent'
        )}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none group">
              <span
                className={cn(
                  'font-serif text-xl md:text-2xl font-bold transition-colors',
                  scrolled ? 'text-emerald' : 'text-white'
                )}
              >
                دار النساء
              </span>
              <span
                className={cn(
                  'text-[10px] tracking-[0.25em] uppercase transition-colors',
                  scrolled ? 'text-gold' : 'text-gold-300'
                )}
              >
                Dar Al Nissaa
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium tracking-wide transition-colors duration-200 hover:text-gold relative group',
                    scrolled ? 'text-emerald' : 'text-white'
                  )}
                >
                  {lang === 'fr' ? link.label : link.labelAr}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className={cn(
                  'hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
                  scrolled
                    ? 'border-emerald text-emerald hover:bg-emerald hover:text-white'
                    : 'border-white/50 text-white hover:border-white'
                )}
              >
                <Globe size={12} />
                {lang === 'fr' ? 'عربية' : 'Français'}
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label={`Panier (${itemCount})`}
              >
                <ShoppingBag
                  size={22}
                  className={scrolled ? 'text-emerald' : 'text-white'}
                />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? (
                  <X size={22} className={scrolled ? 'text-emerald' : 'text-white'} />
                ) : (
                  <Menu size={22} className={scrolled ? 'text-emerald' : 'text-white'} />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-30 bg-emerald flex flex-col pt-24 px-6 md:hidden"
          >
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white"
            >
              <X size={26} />
            </button>

            {/* Links */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 + 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-5 border-b border-white/10 text-white text-2xl font-serif"
                  >
                    <span>{lang === 'fr' ? link.label : link.labelAr}</span>
                    <span className="text-gold text-sm">→</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="mt-auto pb-10 flex items-center gap-4">
              <button
                onClick={toggleLang}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Globe size={16} />
                {lang === 'fr' ? 'عربية' : 'Français'}
              </button>
              <span className="text-white/20">|</span>
              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#25D366] hover:text-white transition-colors"
              >
                WhatsApp Support
              </a>
            </div>

            {/* Decorative */}
            <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <path
                  d="M100,20 L111,55 L148,55 L119,77 L130,112 L100,90 L70,112 L81,77 L52,55 L89,55 Z"
                  fill="white"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

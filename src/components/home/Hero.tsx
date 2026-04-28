'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, Suspense, lazy } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const FloatingElement = lazy(() => import('@/components/animations/FloatingElement'));

const taglines = {
  ar: 'أناقة مغربية أصيلة',
  fr: 'L\'élégance marocaine authentique',
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-emerald flex items-center"
    >
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1617391258031-f8d80b22d6ca?auto=format&fit=crop&w=1920&q=80)',
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald/90 via-emerald/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald/80 via-transparent to-transparent" />
      </motion.div>

      {/* Moroccan pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="hero-star" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M40,10 L44,28 L62,22 L52,36 L70,38 L56,46 L68,60 L50,54 L46,72 L40,56 L34,72 L30,54 L12,60 L24,46 L10,38 L28,36 L18,22 L36,28 Z"
                fill="white"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-star)" />
        </svg>
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gold/20 border border-gold/40 text-gold-300 text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              Nouvelle Collection 2025
            </motion.div>

            {/* Arabic tagline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="font-arabic text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-3 text-right lg:text-left"
              dir="rtl"
            >
              {taglines.ar}
            </motion.h1>

            {/* French tagline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="font-serif text-2xl sm:text-3xl text-gold-300 italic mb-6"
            >
              {taglines.fr}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="text-white/70 text-base md:text-lg mb-10 max-w-md leading-relaxed"
            >
              Qmiss Jouhara, Ghourza, Takchita & Qmayess Rbati — créations artisanales marocaines authentiques. Livraison partout au Maroc.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/collections/qmiss-jouhara"
                className="group relative inline-flex items-center justify-center gap-2 bg-gold text-emerald font-bold px-8 py-4 rounded-full text-base overflow-hidden hover:shadow-gold transition-all duration-300"
              >
                <span className="relative z-10">Voir les Collections</span>
                <motion.span
                  className="absolute inset-0 bg-gold-300"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>

              <Link
                href="/collections/takchita"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/60 text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-white/10 hover:border-white transition-all duration-300"
              >
                Takchita & Rbati
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex items-center gap-8 mt-12"
            >
              {[
                { value: '500+', label: 'Clientes Satisfaites' },
                { value: '100%', label: 'Artisanat Marocain' },
                { value: '24h', label: 'Livraison Rapide' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-gold font-bold text-2xl">{stat.value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* 3D Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="hidden lg:flex items-center justify-center h-[500px]"
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-2 border-gold/30 animate-pulse" />
              </div>
            }>
              <FloatingElement />
            </Suspense>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ opacity }}
      >
        <span className="text-white/40 text-xs tracking-widest uppercase">Défiler</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} className="text-gold" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}

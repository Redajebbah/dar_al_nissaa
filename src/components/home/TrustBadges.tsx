'use client';

import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { GeometricBorder } from '@/components/MoroccanPattern';

const badges = [
  {
    icon: '🇲🇦',
    title: 'Livraison Maroc',
    desc: 'Livraison rapide partout au Maroc sous 24-48h',
  },
  {
    icon: '💳',
    title: 'Cash à la Livraison',
    desc: 'Payez à la réception de votre commande, en toute sécurité',
  },
  {
    icon: '💬',
    title: 'Support WhatsApp',
    desc: 'Notre équipe vous répond 7j/7 sur WhatsApp',
  },
  {
    icon: '✨',
    title: 'Qualité Garantie',
    desc: 'Tous nos produits sont vérifiés et garantis authentiques',
  },
  {
    icon: '🔄',
    title: 'Échange Facile',
    desc: 'Échange gratuit sous 7 jours si la taille ne convient pas',
  },
  {
    icon: '🎁',
    title: 'Emballage Cadeau',
    desc: 'Emballage luxueux offert pour toute commande de plus de 500 MAD',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-20 bg-emerald relative overflow-hidden">
      {/* Moroccan pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="trust-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40,10 L44,28 L62,22 L52,36 L70,38 L56,46 L68,60 L50,54 L46,72 L40,56 L34,72 L30,54 L12,60 L24,46 L10,38 L28,36 L18,22 L36,28 Z" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#trust-pattern)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-14">
          <p className="text-gold text-sm font-semibold tracking-[0.3em] uppercase mb-3">
            Pourquoi Nous Choisir
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Votre Confiance, Notre Priorité
          </h2>
          <GeometricBorder className="mt-6 max-w-xs mx-auto opacity-40" />
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {badges.map((badge) => (
            <StaggerItem key={badge.title}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 rounded-2xl p-5 md:p-6 text-center transition-colors duration-300"
              >
                <div className="text-4xl mb-4">{badge.icon}</div>
                <h3 className="font-semibold text-white text-base mb-2">{badge.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{badge.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

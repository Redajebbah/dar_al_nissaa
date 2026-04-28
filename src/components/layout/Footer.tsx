import Link from 'next/link';
import { GeometricBorder } from '@/components/MoroccanPattern';

const links = {
  collections: [
    { href: '/collections/qmiss-jouhara', label: 'Qmiss Jouhara' },
    { href: '/collections/qmiss-ghourza', label: 'Qmiss Ghourza' },
    { href: '/collections/takchita', label: 'Takchita' },
    { href: '/collections/qmayess-rbati', label: 'Qmayess Rbati' },
  ],
  info: [
    { href: '#', label: 'À Propos' },
    { href: '#', label: 'Livraison & Retours' },
    { href: '#', label: 'Guide des Tailles' },
    { href: '#', label: 'Contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-emerald text-white relative overflow-hidden">
      {/* Moroccan pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="footer-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M30,6 L33,21 L48,12 L39,24 L54,22.5 L42,30 L54,37.5 L39,36 L48,48 L33,39 L30,54 L27,39 L12,48 L21,36 L6,37.5 L18,30 L6,22.5 L21,24 L12,12 L27,21 Z"
                fill="white"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <h2 className="font-serif text-3xl font-bold text-white">دار النساء</h2>
              <p className="text-gold text-sm tracking-widest uppercase mt-1">
                Dar Al Nissaa
              </p>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              L'élégance marocaine à portée de main. Des créations artisanales alliant tradition et modernité pour la femme marocaine d'aujourd'hui.
            </p>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/212600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp: +212 600-000-000</span>
            </a>
          </div>

          {/* Collections */}
          <div>
            <h3 className="font-semibold text-gold uppercase tracking-widest text-xs mb-5">
              Collections
            </h3>
            <ul className="flex flex-col gap-3">
              {links.collections.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-gold uppercase tracking-widest text-xs mb-5">
              Informations
            </h3>
            <ul className="flex flex-col gap-3">
              {links.info.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trust badges mini */}
            <div className="mt-6 flex flex-col gap-2">
              {['🇲🇦 Livraison Maroc', '💳 Cash à la livraison', '🔒 Paiement sécurisé'].map((t) => (
                <span key={t} className="text-white/40 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <GeometricBorder className="mb-6 opacity-20" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-xs">
          <p>© {new Date().getFullYear()} Dar Al Nissaa. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span>🇲🇦 Maroc</span>
            <span>·</span>
            <span>Fait avec ❤️ au Maroc</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

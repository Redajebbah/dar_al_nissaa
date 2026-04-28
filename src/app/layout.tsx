import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import AnimatedCursor from '@/components/AnimatedCursor';

export const metadata: Metadata = {
  title: {
    default: 'Dar Al Nissaa | Mode Marocaine Luxe',
    template: '%s | Dar Al Nissaa',
  },
  description:
    'Boutique en ligne de mode marocaine authentique. Kaftans, Djellabas, Pyjamas et accessoires de luxe. Livraison partout au Maroc. Cash à la livraison.',
  keywords: ['kaftan', 'djellaba', 'pyjama', 'mode marocaine', 'vêtements femme', 'Maroc', 'luxury fashion'],
  authors: [{ name: 'Dar Al Nissaa' }],
  creator: 'Dar Al Nissaa',
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Dar Al Nissaa',
    title: 'Dar Al Nissaa | Mode Marocaine Luxe',
    description: 'Boutique en ligne de mode marocaine authentique. Kaftans, Djellabas et Pyjamas de luxe.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dar Al Nissaa | Mode Marocaine Luxe',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B4332',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-cream min-h-screen">
        {/* Custom cursor (desktop only) */}
        <AnimatedCursor />

        {/* Navigation */}
        <Navbar />

        {/* Cart drawer (global) */}
        <CartDrawer />

        {/* Main content */}
        <main>{children}</main>

        {/* Footer */}
        <Footer />

        {/* Floating WhatsApp button */}
        <WhatsAppButton />
      </body>
    </html>
  );
}

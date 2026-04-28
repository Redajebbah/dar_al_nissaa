'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, MessageCircle, ShoppingBag, Home } from 'lucide-react';

interface OrderData {
  orderId: string;
  form: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
  };
  items: Array<{
    product: { name: { fr: string }; price: number };
    quantity: number;
    selectedSize: string;
    selectedColor: { name: string };
  }>;
  total: number;
}

function formatPrice(n: number) {
  return `${n.toLocaleString('fr-MA')} MAD`;
}

export default function ConfirmationPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('lastOrder');
    if (raw) {
      try {
        setOrder(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream pt-20 pb-16 flex items-center">
      <div className="max-w-2xl mx-auto px-4 w-full">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            {/* Rings */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2.5 * ring, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: ring * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute inset-0 rounded-full border-2 border-gold"
              />
            ))}
            <div className="relative w-24 h-24 bg-gradient-to-br from-gold to-gold-300 rounded-full flex items-center justify-center shadow-gold">
              <CheckCircle size={48} className="text-white" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-4xl md:text-5xl text-emerald font-bold mb-3">
            Commande Confirmée!
          </h1>
          <p className="font-arabic text-2xl text-gold mb-4" dir="rtl">
            تم تأكيد طلبك بنجاح
          </p>
          {order && (
            <div className="inline-flex items-center gap-2 bg-emerald/10 text-emerald px-4 py-2 rounded-full text-sm font-semibold">
              <span>Numéro de commande:</span>
              <span className="font-bold tracking-wider">{order.orderId}</span>
            </div>
          )}
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-card mb-6"
        >
          {order ? (
            <>
              {/* Customer info */}
              <div className="mb-6 p-4 bg-cream-100 rounded-2xl">
                <h3 className="font-semibold text-emerald text-sm uppercase tracking-wider mb-3">
                  Détails de livraison
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Client:</span>
                  <span className="font-medium text-emerald">
                    {order.form.firstName} {order.form.lastName}
                  </span>
                  <span className="text-gray-500">Téléphone:</span>
                  <span className="font-medium text-emerald">{order.form.phone}</span>
                  <span className="text-gray-500">Adresse:</span>
                  <span className="font-medium text-emerald">
                    {order.form.address}, {order.form.city}
                  </span>
                  <span className="text-gray-500">Paiement:</span>
                  <span className="font-medium text-emerald">Cash à la livraison</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-emerald text-sm uppercase tracking-wider mb-3">
                  Articles commandés
                </h3>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-cream-200 last:border-0 text-sm">
                    <div>
                      <p className="font-medium text-emerald">{item.product.name.fr}</p>
                      <p className="text-gray-400 text-xs">{item.selectedSize} · {item.selectedColor.name} · ×{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-emerald">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 font-bold text-emerald">
                  <span>Total</span>
                  <span className="text-xl">{formatPrice(order.total)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Merci pour votre commande!</p>
            </div>
          )}

          {/* Next steps */}
          <div className="bg-emerald/5 rounded-2xl p-4">
            <h3 className="font-semibold text-emerald text-sm mb-3">
              🌟 Prochaines étapes:
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">1.</span>
                Notre équipe vous contactera sous 2h pour confirmer votre commande
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">2.</span>
                Votre colis sera préparé et expédié sous 24h
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">3.</span>
                Livraison à votre domicile sous 24-48h
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">4.</span>
                Paiement en espèces à la réception 💳
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-full font-semibold hover:bg-[#128C7E] transition-colors"
          >
            <MessageCircle size={20} />
            Suivre sur WhatsApp
          </a>

          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald text-white py-4 rounded-full font-semibold hover:bg-emerald-600 transition-colors shadow-luxury"
          >
            <Home size={20} />
            Retour à l'accueil
          </Link>
        </motion.div>

        {/* Thank you message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-gray-400 text-sm mt-6"
        >
          Merci de votre confiance! 🌹 Dar Al Nissaa
        </motion.p>
      </div>
    </div>
  );
}

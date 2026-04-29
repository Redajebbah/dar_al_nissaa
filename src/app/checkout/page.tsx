'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle, ChevronRight, Package, User, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, buildWhatsAppMessage, openWhatsApp } from '@/lib/utils';
import MoroccanPattern from '@/components/MoroccanPattern';
import type { OrderForm } from '@/types';

const steps = [
  { id: 1, label: 'Informations', icon: User },
  { id: 2, label: 'Livraison', icon: MapPin },
  { id: 3, label: 'Confirmation', icon: Package },
];

const moroccanCities = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Meknès',
  'Oujda', 'Kénitra', 'Tétouan', 'Salé', 'Nador', 'Agadir',
  'Béni Mellal', 'Errachidia', 'Mohammedia', 'El Jadida', 'Safi',
  'Khouribga', 'Settat', 'Berrechid', 'Khémisset', 'Laâyoune',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrderForm>({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<OrderForm>>({});

  const updateField = (field: keyof OrderForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<OrderForm> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!form.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!form.phone.trim() || !/^(0|\+212)[5-7]\d{8}$/.test(form.phone))
      newErrors.phone = 'Numéro de téléphone marocain invalide';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors: Partial<OrderForm> = {};
    if (!form.city) newErrors.city = 'Ville requise';
    if (!form.address.trim()) newErrors.address = 'Adresse requise';
    return newErrors;
  };

  const handleNext = () => {
    if (step === 1) {
      const errs = validateStep1();
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    }
    if (step === 2) {
      const errs = validateStep2();
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    }
    setStep((s) => s + 1);
  };

  const handleOrder = async () => {
    setLoading(true);
    const orderId = `DN-${Date.now().toString(36).toUpperCase()}`;

    // 1 — Telegram alert to admin (fire-and-forget, never blocks the client)
    fetch('/api/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, form, items, total }),
    }).catch(() => {/* silent */});

    // 2 — WhatsApp message for the admin
    await new Promise((r) => setTimeout(r, 1200));
    const message = buildWhatsAppMessage(items, form);
    openWhatsApp(message);

    // 3 — Store for confirmation page & navigate
    sessionStorage.setItem('lastOrder', JSON.stringify({ orderId, form, items, total }));
    clearCart();
    router.push('/confirmation');
  };

  if (items.length === 0 && step < 3) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 bg-cream">
        <p className="font-serif text-2xl text-emerald">Votre panier est vide</p>
        <a href="/collections/qmiss-jouhara" className="text-gold hover:underline">
          Découvrir nos collections →
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="relative bg-emerald py-12 overflow-hidden">
        <MoroccanPattern opacity={0.05} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl text-white mb-8">Finaliser la Commande</h1>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <motion.div
                  animate={{
                    scale: step === s.id ? 1.1 : 1,
                  }}
                  className={`flex flex-col items-center gap-2 relative ${
                    step >= s.id ? 'text-white' : 'text-white/30'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step > s.id
                        ? 'bg-gold border-gold'
                        : step === s.id
                        ? 'bg-white border-white'
                        : 'bg-transparent border-white/30'
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircle size={18} className="text-emerald" />
                    ) : (
                      <s.icon
                        size={18}
                        className={step === s.id ? 'text-emerald' : 'text-white/30'}
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                </motion.div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mx-2 transition-all duration-500 ${
                      step > s.id ? 'bg-gold' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-card"
                >
                  <h2 className="font-serif text-2xl text-emerald mb-6">
                    Vos Informations
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        placeholder="Fatima"
                        className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                          errors.firstName
                            ? 'border-red-400'
                            : 'border-cream-300 focus:border-emerald'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        placeholder="Benali"
                        className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                          errors.lastName
                            ? 'border-red-400'
                            : 'border-cream-300 focus:border-emerald'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald mb-2">
                      Téléphone * (format: 0612345678 ou +212612345678)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="0612345678"
                      className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                        errors.phone
                          ? 'border-red-400'
                          : 'border-cream-300 focus:border-emerald'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Delivery */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-card"
                >
                  <h2 className="font-serif text-2xl text-emerald mb-6">
                    Adresse de Livraison
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald mb-2">
                        Ville *
                      </label>
                      <select
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors appearance-none ${
                          errors.city
                            ? 'border-red-400'
                            : 'border-cream-300 focus:border-emerald'
                        }`}
                      >
                        <option value="">Sélectionner votre ville</option>
                        {moroccanCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald mb-2">
                        Adresse complète *
                      </label>
                      <textarea
                        value={form.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        rows={3}
                        placeholder="N° et nom de rue, quartier..."
                        className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none ${
                          errors.address
                            ? 'border-red-400'
                            : 'border-cream-300 focus:border-emerald'
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-400 text-xs mt-1">{errors.address}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald mb-2">
                        Notes de livraison (optionnel)
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        rows={2}
                        placeholder="Instructions spéciales pour le livreur..."
                        className="w-full border-2 border-cream-300 focus:border-emerald rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="mt-6 p-4 bg-emerald/5 border-2 border-emerald/20 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-emerald flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald text-sm">
                          💳 Cash à la Livraison
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Payez en espèces à la réception de votre commande
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-card"
                >
                  <h2 className="font-serif text-2xl text-emerald mb-6">
                    Récapitulatif
                  </h2>

                  {/* Customer info */}
                  <div className="bg-cream-100 rounded-2xl p-4 mb-5">
                    <h3 className="text-sm font-semibold text-emerald mb-3 uppercase tracking-wider">
                      Vos informations
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <span>Nom:</span>
                      <span className="font-medium text-emerald">
                        {form.firstName} {form.lastName}
                      </span>
                      <span>Téléphone:</span>
                      <span className="font-medium text-emerald">{form.phone}</span>
                      <span>Ville:</span>
                      <span className="font-medium text-emerald">{form.city}</span>
                      <span>Adresse:</span>
                      <span className="font-medium text-emerald">{form.address}</span>
                      {form.notes && (
                        <>
                          <span>Notes:</span>
                          <span className="font-medium text-emerald">{form.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}`}
                        className="flex gap-3 items-center"
                      >
                        <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name.fr}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-emerald text-sm line-clamp-1">
                            {item.product.name.fr}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.selectedSize} · {item.selectedColor.name} · ×{item.quantity}
                          </p>
                          <p className="font-bold text-emerald text-sm mt-1">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 text-emerald font-medium text-sm hover:text-gold transition-colors"
                >
                  ← Retour
                </button>
              ) : (
                <a
                  href="/"
                  className="flex items-center gap-2 text-gray-400 font-medium text-sm hover:text-emerald transition-colors"
                >
                  ← Continuer les achats
                </a>
              )}

              {step < 3 ? (
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-emerald text-white px-8 py-3.5 rounded-full font-semibold hover:bg-emerald-600 transition-colors shadow-luxury"
                >
                  Continuer
                  <ChevronRight size={18} />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleOrder}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  className="flex items-center gap-3 bg-gold text-emerald px-8 py-3.5 rounded-full font-bold hover:bg-gold-300 transition-colors shadow-gold disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Package size={20} />
                      Confirmer la Commande
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-card sticky top-24">
              <h3 className="font-serif text-xl text-emerald mb-5">
                Résumé
              </h3>
              <div className="flex flex-col gap-3 mb-5">
                {items.slice(0, 3).map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name.fr}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald font-medium line-clamp-2">
                        {item.product.name.fr}
                      </p>
                      <p className="text-xs text-gray-400">{item.selectedSize}</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{items.length - 3} autre{items.length - 3 > 1 ? 's' : ''} article{items.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald font-medium">
                  <span>Livraison</span>
                  <span>Gratuite 🎉</span>
                </div>
                <div className="flex justify-between text-base font-bold text-emerald pt-2 border-t border-cream-200">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-emerald/5 rounded-xl text-xs text-gray-500 flex items-start gap-2">
                <span>💳</span>
                <span>Cash à la livraison — aucun paiement en ligne requis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

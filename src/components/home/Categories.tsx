'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { GeometricBorder } from '@/components/MoroccanPattern';
import type { CategoryInfo } from '@/types';

interface CategoriesProps {
  categories: CategoryInfo[];
}

export default function Categories({ categories }: CategoriesProps) {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-gold text-sm font-semibold tracking-[0.3em] uppercase mb-3">
            Nos Collections
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-emerald mb-4">
            Explorez Notre Monde
          </h2>
          <GeometricBorder className="mt-6 max-w-xs mx-auto" />
        </ScrollReveal>

        {/* Category grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat) => (
            <StaggerItem key={cat.slug}>
              <Link href={`/collections/${cat.slug}`} className="group block">
                <div className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-card">
                  {/* Image */}
                  <Image
                    src={cat.image}
                    alt={cat.nameFr}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald/90 via-emerald/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                  {/* Decorative corner */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12,2 L13.5,9 L20,7 L16,12 L22,12 L16,15 L20,20 L13.5,18 L12,22 L10.5,18 L4,20 L8,15 L2,12 L8,12 L4,7 L10.5,9 Z"
                        fill="#C9A84C"
                      />
                    </svg>
                  </div>

                  {/* Count badge */}
                  <div className="absolute top-3 left-3 bg-white/90 text-emerald text-xs font-bold px-2.5 py-1 rounded-full">
                    {cat.count} articles
                  </div>

                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <p className="text-gold text-xs font-medium tracking-wider mb-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {cat.nameAr}
                    </p>
                    <h3 className="font-serif text-white text-xl md:text-2xl font-bold">
                      {cat.nameFr}
                    </h3>
                    <p className="text-white/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {cat.description}
                    </p>

                    {/* Arrow */}
                    <div className="mt-3 flex items-center gap-2 text-gold text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
                      <span>Voir tout</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

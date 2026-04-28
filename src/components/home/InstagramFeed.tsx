'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import ScrollReveal from '@/components/animations/ScrollReveal';

const instagramPosts = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1617391258031-f8d80b22d6ca?auto=format&fit=crop&w=400&q=80',
    likes: 342,
    comments: 28,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80',
    likes: 218,
    comments: 15,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    likes: 567,
    comments: 43,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=400&q=80',
    likes: 189,
    comments: 12,
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1544376936-b23a5f53b6ac?auto=format&fit=crop&w=400&q=80',
    likes: 423,
    comments: 35,
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1525507788666-dd37e40b58d3?auto=format&fit=crop&w=400&q=80',
    likes: 301,
    comments: 22,
  },
];

export default function InstagramFeed() {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram size={24} className="text-gold" />
            <p className="text-gold text-sm font-semibold tracking-[0.3em] uppercase">
              @DarAlNissaa
            </p>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-emerald mb-3">
            Notre Instagram
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Suivez-nous pour voir nos dernières créations et l'inspiration du jour
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-3 gap-2 md:gap-3">
          {instagramPosts.map((post, i) => (
            <StaggerItem key={post.id}>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="relative group block aspect-square rounded-xl md:rounded-2xl overflow-hidden cursor-pointer"
              >
                <Image
                  src={post.image}
                  alt={`Instagram post ${post.id}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 33vw, 200px"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-emerald/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <Instagram size={22} className="text-white" />
                  <div className="flex items-center gap-3 text-white text-sm font-medium">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.3} className="text-center mt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-emerald text-emerald px-8 py-3 rounded-full font-semibold hover:bg-emerald hover:text-white transition-all duration-300"
          >
            <Instagram size={18} />
            Suivre sur Instagram
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}

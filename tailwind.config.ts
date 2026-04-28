import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#1B4332',
          50: '#E8F3EE',
          100: '#C6DDD1',
          200: '#8FBFA8',
          300: '#5AA07F',
          400: '#2D7A58',
          500: '#1B4332',
          600: '#163728',
          700: '#112B1E',
          800: '#0C1F15',
          900: '#07130B',
        },
        gold: {
          DEFAULT: '#C9A84C',
          50: '#FBF6E9',
          100: '#F5E9C4',
          200: '#EAD38A',
          300: '#DFBC4F',
          400: '#C9A84C',
          500: '#A88A39',
          600: '#876B2B',
          700: '#654F1F',
          800: '#443414',
          900: '#221A0A',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          50: '#FFFFFF',
          100: '#FAF7F2',
          200: '#F0E9DC',
          300: '#E5D9C4',
          400: '#DACBAD',
          500: '#CFBC95',
          600: '#BFA574',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        arabic: ['var(--font-amiri)', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'moroccan-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.06'%3E%3Cpath d='M30 0l5 10 10-5-5 10 10 5-10 5 5 10-10-5-5 10-5-10-10 5 5-10-10-5 10-5-5-10 10 5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'luxury': '0 4px 30px rgba(27, 67, 50, 0.12)',
        'gold': '0 4px 20px rgba(201, 168, 76, 0.3)',
        'card': '0 2px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 40px rgba(27, 67, 50, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;

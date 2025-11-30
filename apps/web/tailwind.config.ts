import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Investigative Journalism Color Palette
      colors: {
        // Primary - Paper tones
        paper: {
          DEFAULT: '#f4f4f5',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
        },
        // Ink - Dark tones
        ink: {
          DEFAULT: '#18181b',
          50: '#27272a',
          100: '#3f3f46',
          200: '#52525b',
          300: '#71717a',
          400: '#18181b',
        },
        // Highlight - Marker yellow
        highlight: {
          DEFAULT: '#fde047',
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
        },
        // Redaction - Pure black
        redaction: '#000000',
        // Alert colors
        alert: {
          red: '#ef4444',
          orange: '#f97316',
          green: '#22c55e',
        },
        // Stamp colors
        stamp: {
          red: '#dc2626',
          blue: '#2563eb',
        },
      },
      // Typography
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Animations
      animation: {
        'redact-reveal': 'redactReveal 0.8s ease-out forwards',
        'stamp': 'stamp 0.3s ease-out forwards',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink': 'blink 1s step-end infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        redactReveal: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        stamp: {
          '0%': { transform: 'scale(2) rotate(-15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-5deg)', opacity: '1' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(253, 224, 71, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(253, 224, 71, 0.8)' },
        },
      },
      // Shadows
      boxShadow: {
        'paper': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'document': '0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 15px rgba(0, 0, 0, 0.05)',
        'stamp': '2px 2px 4px rgba(0, 0, 0, 0.3)',
      },
      // Background patterns
      backgroundImage: {
        'paper-texture': "url('/textures/paper.png')",
        'redacted-lines': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        'scanlines': 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)',
      },
    },
  },
  plugins: [],
};

export default config;

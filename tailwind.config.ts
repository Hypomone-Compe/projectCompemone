import type { Config } from 'tailwindcss';

/* Struktur dari design system Kabinet TerusTerang (bemuidev/designsystem/companyprofile),
   nilai warnanya versi gelap tema luar angkasa. navy = permukaan menonjol, ink = teks. */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    borderRadius: {
      none: '0',
      sm: 'var(--r-sm)',
      md: 'var(--r-md)',
      lg: 'var(--r-lg)',
      xl: 'var(--r-xl)',
      '2xl': 'var(--r-2xl)',
      full: 'var(--r-full)',
    },
    extend: {
      colors: {
        white: '#FFFFFF',
        'off-white': 'var(--off-white)',
        /* Tema luar angkasa: permukaan kartu & teks utama. */
        surface: { DEFAULT: '#0D1022', 2: '#121632' },
        ink: '#EEF0FB',
        space: '#05060D',
        navy: {
          DEFAULT: '#171C45',
          80: 'var(--navy-80)',
          70: 'var(--navy-70)',
          50: 'var(--navy-50)',
          30: 'var(--navy-30)',
          10: 'var(--navy-10)',
          5: 'var(--navy-05)',
        },
        blue: {
          DEFAULT: '#8297F0',
          hover: 'var(--blue-hover)',
          soft: '#9CB3D3',
          pale: 'var(--blue-pale)',
        },
        maroon: { DEFAULT: '#F29BB0', pale: 'var(--maroon-pale)' },
        red: { DEFAULT: '#F06A6A', hover: 'var(--red-hover)', pale: 'var(--red-pale)' },
        pink: { DEFAULT: '#E8628A', light: '#FFCDD9', pale: 'var(--pink-pale)' },
        accent: {
          DEFAULT: '#E8628A',
          hover: 'var(--accent-hover)',
          pale: 'var(--accent-pale)',
        },
        success: { DEFAULT: 'var(--success)', pale: 'var(--success-pale)' },
        warning: { DEFAULT: 'var(--warning)', pale: 'var(--warning-pale)' },
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        divider: 'var(--divider)',
        glass: {
          DEFAULT: 'var(--glass-bg)',
          strong: 'var(--glass-bg-strong)',
          soft: 'var(--glass-bg-soft)',
          border: 'var(--glass-border)',
        },
        /* Warna aktif per halaman matkul, diisi lewat style={{ '--c': ... }}. */
        c: { DEFAULT: 'var(--c)', on: 'var(--c-on)', pale: 'var(--c-pale)' },
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glass: 'var(--glass-shadow)',
        'glass-soft': 'var(--glass-shadow-soft)',
      },
      backdropBlur: {
        glass: '20px',
        'glass-lg': '24px',
        'glass-md': '12px',
      },
      transitionTimingFunction: { 'out-expo': 'var(--ease-out)' },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: { wrap: '1180px' },
    },
  },
  plugins: [
    ({ addVariant }: { addVariant: (n: string, v: string) => void }) =>
      addVariant('pointer-fine', '@media (pointer: fine)'),
  ],
};

export default config;

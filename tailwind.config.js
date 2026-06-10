function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    } else {
      return `rgb(var(${variableName}))`;
    }
  };
}
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layouts/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1780px',
      '4xl': '2160px', // only need to control product grid mode in ultra 4k device
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#005bff',
          dark: '#004ad6',
          50: '#edf5ff',
          100: '#d7eaff',
          200: '#b7d8ff',
          300: '#86bdff',
          400: '#5598ff',
          500: '#005bff',
          600: '#004ad6',
          700: '#003cab',
          800: '#073782',
          900: '#0b2e64',
        },
        ozon: {
          blue: '#005bff',
          blueDark: '#004ad6',
          pink: '#f91155',
          bg: '#f7f7fa',
          card: '#ffffff',
          text: '#17212b',
          muted: '#707f8d',
          border: '#e5e8ee',
        },
        light: {
          DEFAULT: '#ffffff',
          base: '#646464',
          100: '#f9f9f9',
          200: '#f2f2f2',
          300: '#ededed',
          400: '#e6e6e6',
          500: '#dadada',
          600: '#d2d2d2',
          800: '#bcbcbc',
          900: '#a8a8a8',
        },
        dark: {
          DEFAULT: '#000000',
          base: '#a5a5a5',
          100: '#181818',
          200: '#212121',
          250: '#252525',
          300: '#2a2a2a',
          350: '#2b2b2b',
          400: '#323232',
          450: '#2e2e2e',
          500: '#3e3e3e',
          600: '#4a4a4a',
          700: '#6e6e6e',
          800: '#808080',
          850: '#989898',
          900: '#232323',
          950: '#2b2b2b',
        },
        warning: '#e66767',
        wishlist_price: '#ffffff1a',
        'border-50': withOpacity('--color-border-50'),
        'border-100': withOpacity('--color-border-100'),
        'border-200': withOpacity('--color-border-200'),
        'border-base': withOpacity('--color-border-base'),
        // Promo page colors from Lovable
        'promo-primary': 'hsl(var(--promo-primary))',
        'promo-primary-foreground': 'hsl(var(--promo-primary-foreground))',
        'promo-secondary': 'hsl(var(--promo-secondary))',
        'promo-secondary-foreground': 'hsl(var(--promo-secondary-foreground))',
        'promo-navy': {
          DEFAULT: 'hsl(var(--promo-navy))',
          light: 'hsl(var(--promo-navy-light))',
        },
        'promo-cyan': 'hsl(var(--promo-cyan))',
        'promo-magenta': 'hsl(var(--promo-magenta))',
        'promo-background': 'hsl(var(--promo-background))',
        'promo-foreground': 'hsl(var(--promo-foreground))',
        'promo-card': 'hsl(var(--promo-card))',
        'promo-card-foreground': 'hsl(var(--promo-card-foreground))',
        'promo-border': 'hsl(var(--promo-border))',
      },
      boxShadow: {
        card: '0px 0px 6px rgba(79, 95, 120, 0.1)',
        dropdown: '0px 10px 32px rgba(46, 57, 72, 0.2)',
        'bottom-nav': '0 -2px 3px rgba(0, 0, 0, 0.08)',
      },
      fontSize: {
        '10px': '.625rem',
        '13px': '13px',
        '15px': '15px',
      },
      fontFamily: {
        body: ["'Inter', sans-serif"],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};

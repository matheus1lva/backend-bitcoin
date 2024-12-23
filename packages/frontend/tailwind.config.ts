import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        background: {
          popover: '#FFF',
          DEFAULT: '#FFF',
          primary: '#337AB7',
          secondary: '#FFF'
        },
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#211F33',
          light: '#6E6D7A',
          foreground: '#FFF',
          button: '#337AB7',
          outline: '#337AB7'
        },
        secondary: {
          DEFAULT: '#88859E',
          foreground: '#337AB7'
        },
        gray: {
          100: '#F4F4F5'
        },
        destructive: {
          DEFAULT: '#E50C0C'
        }
      },
      borderColor: {
        DEFAULT: '#D1D0D9'
      },
      fontFamily: {
        sans: [
          '"Inter var", sans-serif',
          {
            fontFeatureSettings: '"cv11", "ss01"',
            fontVariationSettings: '"opsz" 32'
          }
        ]
      }
    }
  }
} satisfies Config

export default config
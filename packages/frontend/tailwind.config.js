const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{ts,tsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        green: {
          25: "#F6FEF9",
          50: "#ECFDF3",
          100: "#D1FADF",
          200: "#A6F4C5",
          300: "#6CE9A6",
          400: "#32D583",
          500: "#12B76A",
          600: "#039855",
          700: "#027A48",
          800: "#05603A",
          900: "#054F31",
        },
        background: {
          popover: "#FFF",
          DEFAULT: "#FFF",
          primary: "#337AB7",
          secondary: "#FFF",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#211F33",
          light: "#6E6D7A",
          foreground: "#FFF",
          button: "#337AB7",
          outline: "#337AB7",
        },
        secondary: {
          DEFAULT: "#88859E",
          foreground: "#337AB7",
        },
        gray: {
          100: "#F4F4F5",
        },
        destructive: {
          DEFAULT: "#E50C0C",
        },
      },
      borderColor: {
        DEFAULT: "#D1D0D9",
      },
      fontFamily: {
        sans: [
          '"Inter var", sans-serif',
          {
            fontFeatureSettings: '"cv11", "ss01"',
            fontVariationSettings: '"opsz" 32',
          },
        ],
      },
    },
  },
};

export default config;

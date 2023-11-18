import { type Config } from "tailwindcss";

const { fontFamily } = require("tailwindcss/defaultTheme")

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'cursive']
      },
      keyframes: {
        slideInFromLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        slideInFromLeft: 'slideInFromLeft 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;

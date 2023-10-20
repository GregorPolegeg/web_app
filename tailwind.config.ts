import { type Config } from "tailwindcss";

const { fontFamily } = require("tailwindcss/defaultTheme")

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'cursive']
      },
    },
  },
  plugins: [],
} satisfies Config;

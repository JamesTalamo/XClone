/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: [
      "light",
      {
        black: {
          "primary": "rgb(29, 155, 240)", // Define the primary color
          "secondary": "rgb(24, 24, 24)", // Define the secondary color
          // Add other theme properties as needed
        },
      },
    ],
  },
}


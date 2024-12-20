/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        print: { raw: "print" }, // Define a 'print' screen to target media query
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: { 
      sm: "350px", 
      md: "767px", 
      lg: "1050px", 
     },
  },
  plugins: [],
};

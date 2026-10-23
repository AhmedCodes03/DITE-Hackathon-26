/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Segoe UI", "system-ui", "-apple-system", "sans-serif"]
      },
      colors: {
        primary: {
          DEFAULT: "#2BA68A",
          dark: "#1A7A62",
          deep: "#0B4A3F",
          light: "#D6EEE7",
          50: "#F0FDF9",
          100: "#D6EEE7",
          200: "#ADE0D0",
          300: "#7BC9B3",
          400: "#4AAD95",
          500: "#2BA68A",
          600: "#1A7A62",
          700: "#0B4A3F",
          800: "#083831",
          900: "#052824",
          950: "#021916"
        },
        accent: {
          DEFAULT: "#E8825A",
          light: "#FDF0EB",
          50: "#FDF5F2",
          100: "#FDF0EB",
          200: "#FADCD1",
          300: "#F5BFAD",
          400: "#EF9C83",
          500: "#E8825A",
          600: "#D9673C",
          700: "#B64F2C",
          800: "#8F3D22",
          900: "#6B2F19"
        },
        surface: "#F5F0EB",
        ink: "#2A2E35",
        slate: {
          50: "#F7F9F8",
          100: "#EEF1F0",
          200: "#D5DDDA",
          300: "#B0C2BC",
          400: "#7A9890",
          500: "#5A6872",
          600: "#4A5860",
          700: "#3A4750",
          800: "#2A2E35",
          900: "#1E2226",
          950: "#141618"
        },
        mist: "#D6EEE7",
        sage: "#9DB8B2"
      },
      backgroundColor: {
        page: "#F7F9F8",
        surface: "#F5F0EB",
        "surface-hover": "#F0EBE5"
      },
      borderColor: {
        mist: "#D6EEE7",
        DEFAULT: "#D6EEE7"
      },
      textColor: {
        ink: "#2A2E35",
        muted: "#5A6872",
        hint: "#9DB8B2",
        primary: "#2BA68A"
      },
      boxShadow: {
        sm: "0 1px 3px 0 rgb(43 166 138 / 0.06), 0 1px 2px -1px rgb(43 166 138 / 0.04)",
        DEFAULT: "0 4px 12px -2px rgb(43 166 138 / 0.08), 0 2px 6px -2px rgb(43 166 138 / 0.05)",
        md: "0 8px 20px -4px rgb(43 166 138 / 0.10), 0 4px 8px -2px rgb(43 166 138 / 0.06)",
        lg: "0 16px 32px -8px rgb(43 166 138 / 0.12), 0 8px 16px -4px rgb(43 166 138 / 0.07)",
        xl: "0 24px 48px -12px rgb(43 166 138 / 0.15), 0 12px 24px -6px rgb(43 166 138 / 0.09)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.04)"
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "slide-in-left": "slideInLeft 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "shimmer": "shimmer 1.8s linear infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      }
    }
  },
  plugins: []
};

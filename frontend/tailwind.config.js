/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          bg: {
            dark: '#0d1117',
            light: '#f6f8fa',
          },
          card: {
            dark: '#161b22',
            light: '#ffffff',
          },
          border: {
            dark: '#30363d',
            light: '#d0d7de',
          },
          muted: {
            dark: '#8b949e',
            light: '#57606a',
          },
          primary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
          },
          accent: {
            blue: '#388bfd',
            orange: '#f0883e',
            purple: '#bc8cff',
            red: '#f85149',
            green: '#3fb950',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

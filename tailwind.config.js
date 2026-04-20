/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        keep: {
          green: '#2ecc71',
          'green-dark': '#27ae60',
          'green-light': '#58d68d'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif']
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-up': 'floatUp 1.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-100px) scale(1.5)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
}

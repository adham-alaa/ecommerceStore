/** @type { import('tailwindcss').Config } */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx,vue,html}'
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Canela', 'serif'],
                'canela': ['Canela', 'serif'],
                'canela-text': ['Canela Text', 'serif'],
            }
        }
    },
    plugins: [],
}
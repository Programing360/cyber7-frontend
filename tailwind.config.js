/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}", // 👈 রুট app ফোল্ডার যোগ করুন
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",   // 👈 src ফোল্ডার
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind CSS가 클래스를 스캔할 파일 경로 설정
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 전자담배 액상 사이트에 맞는 커스텀 색상 설정
      colors: {
        'primary': '#4F46E5', // 인디고 색상
        'secondary': '#10B981', // 에메랄드 색상
        'accent': '#F59E0B', // 앰버 색상
        'background': '#F9FAFB', // 밝은 회색 배경
        'text': '#1F2937', // 어두운 텍스트 색상
      },
      // 반응형 디자인을 위한 화면 크기 설정
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind CSS가 클래스를 스캔할 파일 경로 설정
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'fantasy': ['Fantasy', 'fantasy', 'sans-serif'],
      },
      // 고블린 테마에 맞는 커스텀 색상 설정
      colors: {
        'primary': '#2D5F2D', // 고블린 스킨 녹색
        'secondary': '#8B4513', // 고블린 갑옷 갈색
        'accent': '#FF6B1A', // 고블린 강조 주황색
        'background': '#F0F2E6', // 연한 이끼 녹색 배경
        'text': '#2A2A2A', // 어두운 텍스트 색상
        'goblin-dark': '#1A3A1A', // 어두운 고블린 녹색
        'goblin-light': '#A9C496', // 밝은 고블린 녹색
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

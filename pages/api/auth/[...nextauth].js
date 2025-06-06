import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '../../../models/User';
import crypto from 'crypto';
import {UserLoginLog} from "../../../models";

// SHA-256 해시 함수
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default NextAuth({
  providers: [
    CredentialsProvider({
      debug: process.env.NODE_ENV === 'development',
      name: 'Credentials',
      credentials: {
        email: { label: "이메일", type: "email", placeholder: "이메일을 입력하세요" },
        password: { label: "비밀번호", type: "password", placeholder: "비밀번호를 입력하세요" }
      },
      async authorize(credentials, req) {
        try {
          // 이메일로 사용자 찾기
          const user = await User.findOne({ 
            where: { 
              email: credentials.email,
              deletedAt: null // 탈퇴하지 않은 사용자만
            } 
          });

          // 사용자가 없거나 비밀번호가 일치하지 않으면 null 반환
          // SHA-256으로 해시된 비밀번호 비교
          const hashedInputPassword = hashPassword(credentials.password);
          if (!user || hashedInputPassword !== user.password) {
            return null;
          }

          // 로그인 로그 기록
          await UserLoginLog.create({
            userId: user.id,
            ip: req.headers['x-forwarded-for']
          });

          // 로그인 성공 시 사용자 정보 반환
          return {
            id: user.id,
            email: user.email,
            name: user.nickName,
            grade: user.grade
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 초기 로그인 시 user 객체가 있으면 token에 추가 정보 저장
      if (user) {
        token.id = user.id;
        token.grade = user.grade;
      }
      return token;
    },
    async session({ session, token }) {
      // JWT 토큰에서 세션으로 정보 전달
      if (token) {
        session.user.id = token.id;
        session.user.grade = token.grade;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin', // 커스텀 로그인 페이지 경로
    error: '/auth/error', // 에러 페이지 경로
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  debug: process.env.NODE_ENV === 'development',
});

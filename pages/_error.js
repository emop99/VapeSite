import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function Error({ statusCode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Head>
        <title>
          {statusCode === 500
            ? '서버 오류 | 쥬스고블린 전자담배 액상 최저가 비교 가격 변동'
            : '페이지를 찾을 수 없습니다 | 쥬스고블린 전자담배 액상 최저가 비교 가격 변동'}
        </title>
      </Head>

      <div className="text-center px-4 py-8">
        <div className="mb-6">
          <Image
            src={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}
            alt="쥬스고블린"
            width={120}
            height={30}
            className="mx-auto"
          />
        </div>

        <h1 className="text-6xl font-bold text-primary mb-4">
          {statusCode || '404'}
        </h1>

        <h2 className="text-2xl font-semibold mb-4">
          {statusCode === 500
            ? '서버 오류가 발생했습니다'
            : '페이지를 찾을 수 없습니다'}
        </h2>

        <p className="text-gray-600 mb-8">
          {statusCode === 500
            ? '현재 서버에 문제가 발생했습니다. 빠른 시간 내에 해결하겠습니다.'
            : '요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.'}
        </p>

        <Link href="/" className="btn-primary inline-block">
          메인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

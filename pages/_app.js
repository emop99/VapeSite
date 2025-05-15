import Layout from '../components/Layout';
import '../styles/globals.css';

// 앱 컴포넌트
function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;

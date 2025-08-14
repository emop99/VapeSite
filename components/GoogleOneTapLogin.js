import {useEffect} from 'react';
import {signIn, useSession} from 'next-auth/react';

const GoogleOneTapLogin = () => {
  const {status} = useSession();
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = async (response) => {
    // Google에서 받은 credential(ID 토큰)을 NextAuth의 google provider로 전달합니다.
    const result = await signIn('google', {
      credential: response.credential,
      redirect: false, // 페이지 새로고침 방지
    });

    if (result.error) {
      console.error('Google One-Tap sign-in failed:', result.error);
    }
  };

  useEffect(() => {
    // 사용자가 로그인하지 않았고, 클라이언트 ID가 있으며, 스크립트가 아직 로드되지 않았을 때만 실행합니다.
    const scriptId = 'google-gsi-client';
    if (status === 'unauthenticated' && GOOGLE_CLIENT_ID && !document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.login_uri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
          });
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log(
                'Google One Tap prompt was not displayed:',
                notification.getNotDisplayedReason()
              );
            }
          });
        }
      };
      script.onerror = () => {
        console.error('Google GSI script failed to load.');
      };
      document.head.appendChild(script);

      return () => {
        // 스크립트는 한 번 로드되면 앱 전체에서 사용될 수 있으므로,
        // 컴포넌트 언마운트 시 명시적으로 제거하지 않는 것이 좋을 수 있습니다.
        // 만약 제거해야 한다면, ID를 사용하여 안전하게 제거하는 것이 좋습니다.
        const scriptTag = document.getElementById(scriptId);
        if (scriptTag) document.head.removeChild(scriptTag);
      };
    }
  }, [status, GOOGLE_CLIENT_ID]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
};

export default GoogleOneTapLogin;
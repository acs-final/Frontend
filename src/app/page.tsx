"use client";

import { useEffect } from 'react';

export default function CognitoPage() {
  useEffect(() => {
    // 환경변수에 설정된 값을 인코딩해서 redirect_uri에 사용합니다.
    const redirectURI = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI || "");
    
    window.location.replace(
      `https://ap-northeast-2lod1czvcj.auth.ap-northeast-2.amazoncognito.com/login/continue?client_id=66m5dp0ut61tqrjhvdc10i7tam&redirect_uri=${redirectURI}&response_type=code&scope=email+openid+phone`
    );
  }, []);

  return null;
}


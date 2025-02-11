"use client";

import { useEffect } from 'react';

export default function CognitoPage() {
  useEffect(() => {
    // 페이지가 마운트되면 지정된 URL로 리다이렉트합니다.
    window.location.replace(
      "https://ap-northeast-2lod1czvcj.auth.ap-northeast-2.amazoncognito.com/login/continue?client_id=66m5dp0ut61tqrjhvdc10i7tam&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcognitoresponse&response_type=code&scope=email"
    );
  }, []);

  return null;
}

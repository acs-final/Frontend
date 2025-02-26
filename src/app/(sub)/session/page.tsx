"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // 세션에서 토큰 확인

    if (token) {
      router.replace("/dashboard"); // 세션이 있으면 대시보드로 이동
    } else {
      // 환경변수의 리디렉트 URI를 인코딩
      const redirectURI = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI || "");
      
      // Cognito 로그인 페이지로 리다이렉트
      window.location.replace(
        `https://ap-northeast-2lod1czvcj.auth.ap-northeast-2.amazoncognito.com/login/continue?client_id=66m5dp0ut61tqrjhvdc10i7tam&redirect_uri=${redirectURI}&response_type=code&scope=email+openid+phone`
      );
    }
  }, [router]);

  return null; // 화면을 렌더링하지 않고 즉시 리다이렉트
}

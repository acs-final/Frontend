'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogin() {
      try {
        // /api/logout API 호출 (서버 측 로그아웃 처리)
        await fetch('/api/login', { method: 'POST' });
      } catch (error) {
        console.error("로그인 API 호출 실패:", error);
      } finally {
        // 로그아웃 후 홈 페이지로 이동
        router.replace("/account");
      }
    }
    handleLogin();
  }, [router]);

  return <div>로그인 중입니다... 잠시만 기다려주세요.</div>;
}

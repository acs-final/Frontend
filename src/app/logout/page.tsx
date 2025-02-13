'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      try {
        // /api/logout API 호출 (서버 측 로그아웃 처리)
        await fetch('/api/logout', { method: 'POST' });
      } catch (error) {
        console.error("로그아웃 API 호출 실패:", error);
      } finally {
        // 클라이언트 측의 세션 스토리지 초기화 등 추가 처리가 필요한 경우 수행
        if (typeof window !== "undefined") {
          sessionStorage.clear();

          // 세션 초기화 이벤트 디스패치 (필요한 경우)
          const event = new Event("sessionCleared");
          window.dispatchEvent(event);
        }
        // 로그아웃 후 홈 페이지로 이동
        router.replace("/");
      }
    }
    handleLogout();
  }, [router]);

  return <div>로그아웃 중입니다... 잠시만 기다려주세요.</div>;
}

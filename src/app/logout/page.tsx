'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // 로그아웃 API 호출 (필요한 경우 credentials 옵션 추가)
        await fetch('/api/logout', { 
          method: 'POST',
          credentials: 'include'  // 쿠키를 함께 보내야 한다면 활성화
        });
      } catch (error) {
        console.error("로그아웃 API 호출 실패:", error);
      } finally {
        // 클라이언트 측 세션 스토리지 초기화 및 이벤트 디스패치
        sessionStorage.clear();
        window.dispatchEvent(new Event("sessionCleared"));

        // 로그아웃 후 홈 페이지로 이동
        router.replace("/");
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div>
      로그아웃 중입니다... 잠시만 기다려주세요.
    </div>
  );
}

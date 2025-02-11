'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    function handleLogout() {
      // 세션 스토리지 초기화
      if (typeof window !== "undefined") {
        sessionStorage.clear();

        // 세션 초기화 이벤트 디스패치
        const event = new Event("sessionCleared");
        window.dispatchEvent(event);
      }
      // 로그아웃 후 홈 페이지로 이동
      router.replace("/");
    }
    
    handleLogout();
  }, [router]);

  return <div>로그아웃 중입니다... 잠시만 기다려주세요.</div>;
}

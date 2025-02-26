'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleLogin() {
      try {
        const response = await fetch('/api/login', { method: 'POST' });
        // 응답(response)을 JSON 형태로 읽기
        const data = await response.json();
        console.log("로그인 응답:", data);
        console.log("로그인 result color:", data.result.color);
        sessionStorage.setItem("color", data.result.color);
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

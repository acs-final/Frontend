"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // 페이지 접근 시 "/dashboard"로 리다이렉트
    router.replace("/cognito");
  }, [router]);

  return null; // 화면 렌더링 없이 바로 리다이렉트
}

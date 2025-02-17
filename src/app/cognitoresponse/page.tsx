"use client"; // 클라이언트 사이드에서 실행할 경우 추가 (React 훅 사용시 필요)

import React, { useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js 내비게이션 훅 추가

// JWT 토큰을 디코드하는 함수
function decodeJWT(token: string) {
  const base64Url = token.split(".")[1]; // payload 부분
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Base64Url -> Base64 변환
  const decodedData = atob(base64); // Base64 디코딩
  return JSON.parse(decodedData); // JSON 변환
}

export default function CognitoResponsePage() {
  const router = useRouter();

  useEffect(() => {
    async function fetchToken() {
      // URL에서 인증 코드 추출
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get("code");

      if (!codeFromUrl) {
        console.error("URL에 인증 코드가 없습니다.");
        return;
      }

      try {
        // API 라우트로 토큰 교환 요청 (axios 대신 fetch 사용)
        const response = await fetch("/api/cognitoresponse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: codeFromUrl,
            redirectUri: "http://localhost:3000/cognitoresponse",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error("토큰 교환 에러: " + JSON.stringify(errorData));
        }

        const data = await response.json();
        console.log("응답:", data);

        // 세션스토리지에 토큰 저장
        sessionStorage.setItem("token", JSON.stringify(data));
        sessionStorage.setItem("accessToken", data.access_token);
        sessionStorage.setItem("refreshToken", data.refresh_token);
        sessionStorage.setItem("tokenType", data.token_type);
        sessionStorage.setItem("expiresIn", data.expires_in.toString());

        // access_token 디코딩 후 사용자 정보 저장
        const decoded = decodeJWT(data.access_token);
        sessionStorage.setItem("username", decoded.username);
        sessionStorage.setItem("sub", decoded.sub);

        const memberCookie = sessionStorage.getItem("sub");
        if (memberCookie) {
          document.cookie = `memberCookie=${memberCookie}; path=/; max-age=3600;`;
        }

        // 토큰 저장 완료 후 /login으로 이동
        router.push("/login");
      } catch (error: any) {
        console.log("토큰 교환 에러:", error.message);
      }
    }

    fetchToken();
  }, [router]);

  return <div></div>;
}

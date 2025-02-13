"use client"; // 클라이언트 사이드에서 실행할 경우 추가 (React 훅 사용시 필요)

import React, { useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import qs from "querystring";
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

      // 올바른 토큰 엔드포인트 ("/oauth2/token" 포함)
      const tokenEndpoint =
        "https://ap-northeast-2lod1czvcj.auth.ap-northeast-2.amazoncognito.com/oauth2/token";
      const params = {
        grant_type: "authorization_code",
        client_id: "66m5dp0ut61tqrjhvdc10i7tam",
        code: codeFromUrl,
        redirect_uri: "http://localhost:3000/cognitoresponse",
      };

      try {
        const response: AxiosResponse = await axios.post(
          tokenEndpoint,
          qs.stringify(params),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        console.log("응답:", response);
        // console.log("토큰 응답:", response.data);

        // 세션스토리지에 토큰 저장
        sessionStorage.setItem("token", JSON.stringify(response.data));
        sessionStorage.setItem("accessToken", response.data.access_token);
        sessionStorage.setItem("refreshToken", response.data.refresh_token);
        sessionStorage.setItem("tokenType", response.data.token_type);
        sessionStorage.setItem("expiresIn", response.data.expires_in.toString());

        // access_token 디코딩 후 사용자 정보 저장
        const decoded = decodeJWT(response.data.access_token);
        sessionStorage.setItem("username", decoded.username);
        sessionStorage.setItem("sub", decoded.sub);

        // console.log("accessToken:", response.data.access_token);
        // console.log("sub:", decoded.sub);
        // const memberId = sessionStorage.getItem("sub");
        // console.log("memberId:", memberId);

        const memberCookie = sessionStorage.getItem("sub");
        if (memberCookie) {
          document.cookie = `memberCookie=${memberCookie}; path=/; max-age=3600;`;
        }
        // access token을 /account로 POST 요청하여 서버로 전송
        // await axios.post("/account", {
        //   accessToken: response.data.access_token,
        // });

        // 세션스토리지 저장 완료 후 커스텀 이벤트 디스패치
        // window.dispatchEvent(new Event("sessionCleared"));

        // 세션스토리지 저장 완료 후 /createbook으로 이동
        router.push("/login");
      } catch (error: any) {
        if (error.response) {
          console.error("토큰 교환 에러:", error.response.data);
        } else {
          console.error("토큰 교환 에러 (응답 없음):", error.message);
        }
      }
    }

    fetchToken();
  }, [router]);

  return <div></div>;
}

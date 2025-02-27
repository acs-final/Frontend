import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // process.env.EXTERNAL_API_URL가 있으면 사용, 없으면 기본값 사용
  const cookieStore = await cookies();
  const memberCookie = cookieStore.get("memberCookie")?.value;

  const baseApiUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
  // const baseApiUrl = "http://192.168.2.141:8080/v1";

  // baseApiUrl의 마지막 '/'가 있으면 제거 후 '/fairytale/sonnet' 경로 추가
  const externalApiUrl = `${baseApiUrl.replace(/\/$/, "")}/fairytale/sonnet/streaming`;
  console.log("externalApiUrl:", externalApiUrl);
  // request body 파싱
  const requestBody = await request.json();

  // 외부 API 호출 (fetch)
  const externalResponse = await fetch(externalApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "memberid": memberCookie || '', // memberCookie가 없는 경우 빈 문자열
    },
    body: JSON.stringify(requestBody)
  });

  // 바디(ReadableStream)가 없으면 오류
  if (!externalResponse.body) {
    return new Response("No body from external API", { status: 500 });
  }

  // 외부 응답의 body(ReadableStream)를 그대로 리턴해줌
  return new Response(externalResponse.body, {
    // 외부 응답의 Content-Type이 있으면 그대로 사용, 없으면 text/plain
    headers: {
      "Content-Type": externalResponse.headers.get("Content-Type") || "text/plain",
    },
    // 필요하면 외부 응답의 상태 코드 등을 그대로 반환
    status: externalResponse.status,
    statusText: externalResponse.statusText,
  });
}

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 요청 데이터 로깅
    const { code, redirectUri } = await request.json();
    console.log("POST 요청 받은 데이터:", { code, redirectUri });

    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!clientId) {
      console.error("COGNITO_CLIENT_ID가 설정되지 않았습니다.");
      return NextResponse.json({ error: "서버 구성 오류: clientId 누락" }, { status: 500 });
    }

    // 요청 파라미터 구성
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
    });

    // 헤더 구성 (클라이언트 시크릿을 사용하지 않는 경우)
    const headers: HeadersInit = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    console.log("요청 파라미터:", params.toString());

    // EXTERNAL_API_URL 환경변수 사용, 없으면 기본 URL 사용
    const externalApiUrl =
      process.env.EXTERNAL_API_URL ||
      "http://192.168.2.141:8080/v1";

    if (!process.env.EXTERNAL_API_URL) {
      console.warn("EXTERNAL_API_URL이 설정되지 않아 기본 URL을 사용합니다:", externalApiUrl);
    }

    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers,
      body: params.toString(),
    });

    const data = await response.json();
    console.log("응답 코드:", response.status, data);

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "서버 오류" }, { status: 500 });
  }
}
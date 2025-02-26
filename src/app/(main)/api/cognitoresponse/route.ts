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

    // 클라이언트 시크릿을 사용하지 않는 경우의 헤더
    const tokenUrl =
      "https://ap-northeast-2lod1czvcj.auth.ap-northeast-2.amazoncognito.com/oauth2/token";

    const headers: HeadersInit = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    console.log("Cognito 요청 파라미터:", params.toString());

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers,
      body: params.toString(),
    });

    const data = await response.json();
    console.log("Cognito 응답 코드:", response.status, data);

    if (!response.ok) {
      // console.error("Cognito 요청 실패:", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    // console.error("서버 오류 발생:", error.message);
    return NextResponse.json({ error: error.message || "서버 오류" }, { status: 500 });
  }
}
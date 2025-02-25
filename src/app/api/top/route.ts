import {  NextResponse } from "next/server";

const externalApiUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";

export async function GET() {
  try {
    // 외부 API URL을 환경변수에서 받아와 사용하며, 없을 경우 기본 URL을 사용합니다.
    const response = await fetch(`${externalApiUrl}/fairytale/top`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: '추천 도서를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

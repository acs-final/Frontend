// app/api/createbook/route.js (Next.js App Directory 방식)
import { NextResponse } from "next/server";

// 요청 데이터를 위한 타입 정의 (필요에 따라 확장 가능)
// type CreateBookRequest = {
//   genre?: string;
//   gender?: string;
//   challenge?: string;
// };

export async function GET(request: Request) {
  try {
    // 요청 URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");

    // 환경변수나 기본 URL을 이용해 외부 API의 기본 URL 설정
    const baseExternalApiUrl = process.env.EXTERNAL_API_URL
      ? process.env.EXTERNAL_API_URL.replace(/\/$/, "")
      : "http://192.168.2.141:8080/v1";
      
    // 외부 API 경로 (필요에 따라 "recommended" 혹은 "recommanded" 수정)
    let externalApiUrl = `${baseExternalApiUrl}/bookstore/recommanded/`;
    
    // genre 값이 있을 경우 쿼리 파라미터로 추가
    if (genre) {
      externalApiUrl += `?genre=${encodeURIComponent(genre)}`;
    }

    console.log(externalApiUrl);
    // GET 요청에서 Content-Type 헤더는 불필요할 수 있으므로 제거
    const externalResponse = await fetch(externalApiUrl, {
      method: "GET",
    });

    if (!externalResponse.ok) {
      throw new Error(`외부 API 호출 실패: ${externalResponse.status}`);
    }

    // 외부 API 응답 데이터 읽기
    const externalData = await externalResponse.json();

    return NextResponse.json({
      isSuccess: externalData.isSuccess,
      code: externalData.code,
      message: externalData.message,
      result: externalData.result,
    });
  } catch (error) {
    console.error("API 호출 중 에러:", error);
    return NextResponse.json(
      {
        isSuccess: false,
        message: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
  
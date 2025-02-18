// app/api/createbook/route.js (Next.js App Directory 방식)
import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// 요청 데이터를 위한 타입 정의 (필요에 따라 확장 가능)
type CreateBookRequest = {
  genre?: string;
  gender?: string;
  challenge?: string;
};

export async function POST(request: Request) {
  try {
    // 클라이언트에서 전달받은 JSON 본문 추출
    const reqBody: CreateBookRequest = await request.json();
    console.log("reqBody:", reqBody);

    // 환경 변수에서 외부 API URL을 가져오거나 기본값 사용 (기본 URL은 "http://192.168.2.141:8080/v1")
    const baseExternalApiUrl = process.env.EXTERNAL_API_URL
      ? process.env.EXTERNAL_API_URL.replace(/\/$/, "")
      : "http://192.168.2.141:8080/v1";
    
    // books 경로를 추가
    let externalApiUrl = `${baseExternalApiUrl}/books`;

    // genre 값이 있는 경우 쿼리 파라미터로 추가
    if (reqBody.genre) {
      externalApiUrl += `?genre=${encodeURIComponent(reqBody.genre)}`;
    }

    // 외부 API 호출 (GET 메서드 사용, body 제거)
    const externalResponse = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("externalResponse:", externalResponse);

    if (!externalResponse.ok) {
      console.log(
        "외부 API 응답 상태:",
        externalResponse.status,
        externalResponse.statusText
      );
      throw new Error("외부 API 호출에 실패했습니다.");
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
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
  
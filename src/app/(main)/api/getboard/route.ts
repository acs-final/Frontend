// app/api/createbook/route.js (Next.js App Directory 방식)
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {

    // 환경 변수에서 외부 API의 Base URL을 가져오거나 기본값 사용
    const baseUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    const externalApiUrl = `${baseUrl}/bookstore/`;

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // "memberId": memberCookie ?? "",
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
    console.error("로그인 중 에러:", error);
    if (error instanceof Error) {
      console.error("에러 메시지:", error.message);
    }
    return NextResponse.json(
      { isSuccess: false, message: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
  
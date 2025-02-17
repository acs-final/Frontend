// app/api/createbook/route.js (Next.js App Directory 방식)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 요청 데이터를 위한 타입 정의 (업데이트된 요청 구조)
type CreateBoardRequest = {
  title: string;
  body: string;
  score: number;
  fairytaleId: number;
  imageUrl: string;
};

export async function POST(request: Request) {
  try {
    // console.log("route.tsx 진입");
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;

    // 요청 본문을 업데이트된 타입으로 파싱
    const reqBody: CreateBoardRequest = await request.json();
    // console.log("reqBody::::::::::::::::::::::::::::::::", reqBody);

    // 환경 변수에서 외부 API URL을 가져오거나 기본값("http://192.168.2.141:8080/v1") 사용
    const externalApiUrl =
      process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
      },
      body: JSON.stringify(reqBody),
    });
    // console.log("externalResponse::::::::::::::::::::::::::::::::", externalResponse);

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
    // console.log("route.tsx:", externalData);

    return NextResponse.json({
      isSuccess: externalData.isSuccess,
      code: externalData.code,
      message: externalData.message,
      result: externalData.result,
    });
  } catch (error) {
    console.error("API 호출 중 에러:", error);
    if (error instanceof Error) {
      console.error("에러 메시지:", error.message);
    }
    return NextResponse.json(
      { isSuccess: false, message: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
  
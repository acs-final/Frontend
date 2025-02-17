// app/api/createbook/route.js (Next.js App Directory 방식)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 요청 데이터를 위한 타입 정의 (필요에 따라 확장 가능)
type CreateBookRequest = {
  genre: string;
  gender: string;
  challenge: string;
};

export async function GET(request: Request) {
  try {
    // console.log("route.tsx 진입");
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;
    console.log("login route token:", memberCookie);

    // const reqBody: CreateBookRequest = await request.json();

    // 환경 변수에서 외부 API base URL을 가져오거나 기본값 사용
    const baseUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    // 추가적으로 붙일 엔드포인트
    const endpoint = "/fairytale/dashboard";
    // baseUrl의 끝에 '/'가 있는지 체크하여 중복을 피함
    const externalApiUrl = baseUrl.endsWith("/") ? `${baseUrl.slice(0, -1)}${endpoint}` : `${baseUrl}${endpoint}`;

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
      },
      // 필요한 경우 request 데이터를 body에 포함시키세요.
      // body: JSON.stringify(reqBody),
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
    // console.log("route.tsx:", externalData);

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
  
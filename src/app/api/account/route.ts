// app/api/account/route.tsx (Next.js App Directory 방식)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(_request: Request) {
  try {
    // console.log("route.tsx 진입");
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;
    console.log("account route token:", memberCookie);

    // const reqBody: CreateBookRequest = await request.json();

    // 기본 URL을 환경 변수 또는 기본 값으로 설정한 후, '/members/' 경로를 추가합니다.
    const baseUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    const externalApiUrl = `${baseUrl}/members/`;

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
        // "name": "google_110277259246938366893",
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
    console.error("프로필 조회 중 에러:", error);
    if (error instanceof Error) {
      console.error("에러 메시지:", error.message);
    }
    return NextResponse.json(
      { isSuccess: false, message: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
  
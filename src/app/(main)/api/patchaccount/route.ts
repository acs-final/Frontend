// app/api/account/route.tsx (Next.js App Directory 방식)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;

    // JSON 데이터를 파싱합니다.
    const reqBody = await request.json();

    // 환경 변수에서 외부 API URL을 가져오거나 기본값을 사용합니다.
    // 기본값은 "http://192.168.2.141:8080/v1"이고, 후에 "/members/"를 붙입니다.
    const baseUrl = process.env.EXTERNAL_API_URL ?? "http://192.168.2.141:8080/v1";
    const externalApiUrl = `${baseUrl.replace(/\/$/, "")}/members/`;

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
      },
      // 필요한 경우 request 데이터를 body에 포함시키세요.
      body: JSON.stringify(reqBody),
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
  
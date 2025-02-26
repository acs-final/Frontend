// app/api/account/route.tsx (Next.js App Directory 방식)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;

    // JSON 데이터를 파싱합니다.
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop() as string;
    
    // 환경 변수에서 외부 API 기본 URL을 가져오거나 기본값 사용
    const baseUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    // v1 뒤에 기존 값인 /bookstore/${id}를 추가합니다.
    const externalApiUrl = `${baseUrl}/bookstore/${id}`;

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
        // "name": "google_110277259246938366893",
      },
    });

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
  
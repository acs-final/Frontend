// app/api/account/route.tsx (Next.js App Directory 방식)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    // console.log("route.tsx 진입");
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;

    // JSON 데이터를 파싱합니다.
    // const reqBody = await request.json();

    // EXTERNAL_API_URL을 환경 변수로부터 받아 기본 URL로 설정합니다.
    // EXTERNAL_API_URL이 http://192.168.2.141:8080/v1와 같이 주어지면,
    // 그 뒤에 '/members/fairytale'를 붙여서 최종 URL을 구성합니다.
    const baseApiUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    const externalApiUrl = `${baseApiUrl}/members/fairytale`;

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
        // "name": "google_110277259246938366893",
      },
      // 필요한 경우 request 데이터를 body에 포함시키세요.
    //   body: JSON.stringify(reqBody),
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
    console.error("내 책방 조회 중 에러:", error);
    if (error instanceof Error) {
      console.error("에러 메시지:", error.message);
    }
    return NextResponse.json(
      { isSuccess: false, message: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
  
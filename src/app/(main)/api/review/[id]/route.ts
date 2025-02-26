import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("body:", body);
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;
    const externalApiUrl = process.env.EXTERNAL_API_URL
      ? `${process.env.EXTERNAL_API_URL.replace(/\/+$/, "")}/reports/`
      : "http://192.168.2.141:8080/reports/";

    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
      },
      body: JSON.stringify(body),
    });

    // 포워딩 응답 파싱
    const forwardedResult = await response.json();

    if (!response.ok) {
      console.error("원격 서버에서 오류 응답을 받았습니다:", forwardedResult);
      return NextResponse.json(
        { error: "원격 서버에서 오류 응답을 받았습니다.", details: forwardedResult },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "독후감 제출 성공", result: forwardedResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("API /review POST 에러:", error);
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}

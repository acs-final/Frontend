import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    console.log("서버에서 받은 accessToken:", accessToken);

    // accessToken을 포워딩할 URL로 전달합니다.
    const response = await fetch("http://192.168.2.141:8080/members/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
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
      { message: "Access token이 성공적으로 전달되었습니다.", result: forwardedResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("API /cognitoresponse POST 에러:", error);
    return NextResponse.json(
      { error: "서버 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}

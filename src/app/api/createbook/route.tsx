// app/api/createbook/route.js (Next.js App Directory 방식)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 요청 데이터를 위한 타입 정의 (필요에 따라 확장 가능)
type CreateBookRequest = {
  genre: string;
  gender: string;
  challenge: string;
};

export async function POST(request: Request) {
  try {
    console.log("route.tsx 진입");
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;
    console.log("route token:", memberCookie);
    
    // 클라이언트로부터 전달받은 accessToken 헤더 추출
    // const accessToken = request.headers.get("accessToken") || "";
    // const memberId = request.headers.get("sub") || "";
    // console.log("memberId:", memberId);
    // console.log("route accessToken:", accessToken);

    // 클라이언트로부터 전송된 데이터를 읽어옴
    const reqBody: CreateBookRequest = await request.json();
    const { genre, gender, challenge } = reqBody;

    // 환경 변수에서 외부 API URL을 가져오거나 기본값 사용
    const externalApiUrl =
      process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1/fairytale/sonnet";

    // 외부 API 호출 (실제 URL 및 요청 데이터에 맞게 수정)
    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
        // "accessToken": accessToken, // 외부 API로 accessToken 전달
      },
      body: JSON.stringify({ genre, gender, challenge }),
    });
    console.log("externalResponse:", externalResponse);

    if (!externalResponse.ok) {
      console.log("외부 API 응답 상태:", externalResponse.status, externalResponse.statusText);
      throw new Error("외부 API 호출에 실패했습니다.");
    }

    // 외부 API의 응답 데이터 읽기
    const externalData = await externalResponse.json();
    console.log("route.tsx:", externalData);

    /*
      외부 API의 응답 예시:
      {
        "isSuccess": true,
        "code": "COMMON200",
        "message": "성공입니다.",
        "result": {
            "title": "꿈을 향해 날아오르는 소년 하늘이",
            "body": {
                "page1": "내용1",
                "page2": "내용2",
                ...
            },
            "keywords": ["꿈", "비행기 조종사", ...]
        }
      }
    */

    // 외부 API에서 받은 응답 데이터를 그대로 반환하거나 추가 가공 가능
    return NextResponse.json({
      isSuccess: externalData.isSuccess,
      code: externalData.code,
      message: externalData.message,
      result: externalData.result,
    });
  } catch (error) {
    console.error("동화 생성 중 에러:", error);
    if (error instanceof Error) {
      console.error("에러 메시지:", error.message);
    }
    return NextResponse.json(
      { isSuccess: false, message: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
  
// app/api/createbook/route.js (Next.js App Directory 방식)
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 클라이언트로부터 전송된 데이터를 읽어옴
    const reqBody = await request.json();
    const { genre, gender, challenge } = reqBody;

    // 예시: 외부 API 호출 (실제 URL 및 요청 데이터에 맞게 수정)
    const externalResponse = await fetch("http://192.168.2.141:8080/v1/fairytale/sonnet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 요청에 필요한 필드를 JSON 형태로 전송
      body: JSON.stringify({ genre, gender, challenge }),
    });

    if (!externalResponse.ok) {
      throw new Error("외부 API 호출에 실패했습니다.");
    }

    // 외부 API의 응답 데이터 읽기
    const externalData = await externalResponse.json();
    console.log('routejs',externalData);

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
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다.";
    return NextResponse.json(
      { isSuccess: false, message: errorMessage },
      { status: 500 }
    );
  }
}
  
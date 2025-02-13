import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers"; // ✅ 쿠키 가져오기

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    console.log("📌 [게시판 API] 댓글 추가 요청 수신");

    const { id } = context.params;
    if (!id) {
      throw new Error("❌ 게시글 ID가 없습니다.");
    }
    console.log("📌 [게시판 API] 요청된 게시글 ID:", id);

    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;
    console.log("📌 [게시판 API] 가져온 memberCookie:", memberCookie);

    if (!memberCookie) {
      console.warn("❌ `memberCookie`가 없습니다.");
      return NextResponse.json(
        { isSuccess: false, code: "COMMON400", message: "❌ memberCookie가 필요합니다." },
        { status: 400 }
      );
    }

    // ✅ 요청 본문 확인 (비어 있을 경우 기본값 설정)
    let reqBody;
    try {
      reqBody = await request.json();
    } catch (error) {
      console.warn("⚠️ 요청 본문(JSON) 파싱 오류:", error);
      return NextResponse.json(
        { isSuccess: false, code: "COMMON400", message: "❌ 요청 본문이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    console.log("📌 [게시판 API] 받은 요청 데이터:", reqBody);

    if (!reqBody || !reqBody.content || reqBody.score == null) {
      return NextResponse.json(
        { isSuccess: false, code: "COMMON400", message: "❌ content와 score 값이 필요합니다." },
        { status: 400 }
      );
    }

    // ✅ score 값이 0~5 사이, 0.5 단위인지 검증
    if (reqBody.score < 0 || reqBody.score > 5 || reqBody.score % 0.5 !== 0) {
      return NextResponse.json(
        { isSuccess: false, code: "COMMON400", message: "❌ score 값은 0~5 범위, 0.5 단위여야 합니다." },
        { status: 400 }
      );
    }

    console.log("📌 [게시판 API] 유효한 요청 데이터 확인 완료:", reqBody);

    // ✅ 외부 API URL 설정
    const externalApiUrl = `http://192.168.2.141:8080/v1/comment/${id}`;
    console.log(`📌 [게시판 API] 외부 API 요청: ${externalApiUrl}`);

    // ✅ 외부 API로 요청 보내기 (`memberCookie` 포함)
    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie, // ✅ 필수 헤더 추가
      },
      body: JSON.stringify(reqBody), // ✅ JSON 변환 후 전송
    });

    if (!externalResponse.ok) {
      console.warn("❌ 외부 API 응답 실패:", externalResponse.status);
      const errorResponse = await externalResponse.text();
      console.warn("❌ 외부 API 응답 본문:", errorResponse);
      return NextResponse.json(
        { isSuccess: false, code: "COMMON500", message: "❌ 외부 API 호출 실패", error: errorResponse },
        { status: externalResponse.status }
      );
    }

    const externalData = await externalResponse.json();
    console.log("📌 [게시판 API] 외부 API 응답 데이터:", externalData);

    return NextResponse.json(externalData, { status: 200 });
  } catch (error) {
    console.error("🚨 [게시판 API] 서버 오류 발생:", error);
    return NextResponse.json(
      { isSuccess: false, code: "COMMON500", message: "🚨 서버 내부 오류 발생" },
      { status: 500 }
    );
  }
}

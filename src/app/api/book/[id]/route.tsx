import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers"; // ✅ 쿠키 비동기 처리

export async function POST(
  request: NextRequest,
  context: { params: { id: string } } // ✅ params 비동기 처리 제거
) {
  try {
    console.log("📌 [게시판 API] 댓글 추가 요청 수신");

    // ✅ `params` 비동기 처리 제거 (이제 동기적 사용 가능)
    const { id } = context.params;
    if (!id) {
      throw new Error("❌ 게시글 ID가 없습니다.");
    }
    console.log("📌 [게시판 API] 요청된 게시글 ID:", id);

    // ✅ 비동기적으로 쿠키에서 `memberId` 가져오기
    const cookieStore = await cookies();
    const memberId = cookieStore.get("memberId")?.value;

    if (!memberId) {
      console.warn("❌ `memberId`가 없습니다.");
      return NextResponse.json(
        { isSuccess: false, code: "COMMON400", message: "❌ memberId가 필요합니다." },
        { status: 400 }
      );
    }

    // ✅ 요청 데이터 처리 (body가 비어있는 경우 방어 코드 추가)
    let reqBody = {};
    if (request.bodyUsed) {
      try {
        reqBody = await request.json();
      } catch (error) {
        console.warn("⚠️ 요청 본문(JSON) 파싱 오류:", error);
        return NextResponse.json(
          { isSuccess: false, code: "COMMON400", message: "❌ 요청 본문이 올바르지 않습니다." },
          { status: 400 }
        );
      }
    } else {
      console.warn("⚠️ 요청 본문이 비어 있습니다.");
      return NextResponse.json(
        { isSuccess: false, code: "COMMON400", message: "❌ 요청 본문이 필요합니다." },
        { status: 400 }
      );
    }

    console.log("📌 [게시판 API] 요청 데이터:", reqBody);

    if (!reqBody || !reqBody.content || reqBody.score == null) {
      return NextResponse.json(
        { isSuccess: false, code: "COMMON400", message: "❌ content와 score 값이 필요합니다." },
        { status: 400 }
      );
    }

    // ✅ 외부 API URL 설정
    const externalApiUrl = `http://192.168.2.141:8080/v1/comment/${id}`;
    console.log(`📌 [게시판 API] 외부 API 요청: ${externalApiUrl}`);

    // ✅ 외부 API로 요청 보내기 (`memberId` 추가)
    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberId, // ✅ 필수 헤더 추가
      },
      body: JSON.stringify(reqBody),
    });

    if (!externalResponse.ok) {
      console.warn("❌ 외부 API 응답 실패:", externalResponse.status);
      const errorResponse = await externalResponse.text(); // 오류 메시지 확인
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

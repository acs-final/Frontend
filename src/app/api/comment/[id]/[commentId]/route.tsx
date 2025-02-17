import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// ✅ 댓글 수정 API (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    console.log("📌 [게시판 API] 댓글 수정 요청 수신");

    const { id, commentId } = params;
    console.log(`📌 요청된 게시글 ID: ${id}, 댓글 ID: ${commentId}`);

    if (!id || !commentId) {
      console.warn("❌ 게시글 ID 또는 댓글 ID가 없습니다.");
      return NextResponse.json(
        {
          isSuccess: false,
          code: "COMMON400",
          message: "❌ 게시글 ID와 댓글 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    // ✅ 요청 데이터 받기
    const reqBody = await request.json();
    console.log("📌 [게시판 API] 요청 데이터:", reqBody);

    const { content, score } = reqBody;
    if (!content || score == null) {
      console.warn("❌ 댓글 내용과 점수가 비어 있습니다.");
      return NextResponse.json(
        {
          isSuccess: false,
          code: "COMMON400",
          message: "❌ 댓글 내용과 점수를 입력하세요.",
        },
        { status: 400 }
      );
    }

    // ✅ 쿠키에서 `memberId` 가져오기
    const cookieStore = await cookies();
    const memberId = cookieStore.get("memberCookie")?.value;
    console.log("📌 [게시판 API] memberId:", memberId);

    if (!memberId) {
      console.warn("❌ `memberId`가 없습니다.");
      return NextResponse.json(
        {
          isSuccess: false,
          code: "COMMON400",
          message: "❌ memberId가 필요합니다.",
        },
        { status: 400 }
      );
    }

    // 외부 API URL 설정: EXTERNAL_API_URL에 http://192.168.2.141:8080/v1 를 전달할 예정이므로 base는 해당 URL입니다.
    const baseApiUrl =
      process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    const externalApiUrl = `${baseApiUrl}/comment/${id}/${commentId}`;
    
    // ✅ 외부 API로 요청 보내기
    console.log(`📌 [게시판 API] 외부 API 요청: ${externalApiUrl}`);
    const externalResponse = await fetch(externalApiUrl, {
      method: "PATCH", // ✅ 여기서도 `PATCH`로 변경!
      headers: {
        "Content-Type": "application/json",
        memberId: memberId, // ✅ memberId 추가
      },
      body: JSON.stringify({ content, score }),
    });

    if (!externalResponse.ok) {
      console.warn("❌ 외부 API 응답 실패:", externalResponse.status);
      return NextResponse.json(
        {
          isSuccess: false,
          code: "COMMON500",
          message: "❌ 외부 API 호출 실패",
        },
        { status: externalResponse.status }
      );
    }

    // ✅ 외부 API 응답 데이터 확인
    const externalData = await externalResponse.json();
    console.log("📌 [게시판 API] 외부 API 응답 데이터:", externalData);

    return NextResponse.json(externalData, { status: 200 });
  } catch (error) {
    console.error("🚨 [게시판 API] 서버 오류 발생:", error);
    return NextResponse.json(
      {
        isSuccess: false,
        code: "COMMON500",
        message: "🚨 서버 내부 오류 발생",
      },
      { status: 500 }
    );
  }
}

// ✅ 댓글 삭제 API (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    console.log("📌 [게시판 API] 댓글 삭제 요청 수신");

    const { id, commentId } = params;
    console.log(`📌 요청된 게시글 ID: ${id}, 댓글 ID: ${commentId}`);

    if (!id || !commentId) {
      console.warn("❌ 게시글 ID 또는 댓글 ID가 없습니다.");
      return NextResponse.json(
        {
          isSuccess: false,
          code: "COMMON400",
          message: "❌ 게시글 ID와 댓글 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    // ✅ 쿠키에서 `memberId` 가져오기
    const cookieStore = await cookies();
    const memberId = cookieStore.get("memberCookie")?.value;
    console.log("📌 [게시판 API] memberId:", memberId);

    if (!memberId) {
      console.warn("❌ `memberId`가 없습니다.");
      return NextResponse.json(
        {
          isSuccess: false,
          code: "COMMON400",
          message: "❌ memberId가 필요합니다.",
        },
        { status: 400 }
      );
    }

    // 외부 API URL 설정: EXTERNAL_API_URL에 http://192.168.2.141:8080/v1 를 전달할 예정이므로 base는 해당 URL입니다.
    const baseApiUrl =
      process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    const externalApiUrl = `${baseApiUrl}/comment/${id}/${commentId}`;

    // ✅ 외부 API로 요청 보내기
    console.log(`📌 [게시판 API] 외부 API 요청: ${externalApiUrl}`);
    const externalResponse = await fetch(externalApiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        memberId: memberId, // ✅ memberId 추가
      },
    });

    if (!externalResponse.ok) {
      console.warn("❌ 외부 API 응답 실패:", externalResponse.status);
      return NextResponse.json(
        {
          isSuccess: false,
          code: "COMMON500",
          message: "❌ 외부 API 호출 실패",
        },
        { status: externalResponse.status }
      );
    }

    // ✅ 외부 API 응답 데이터 확인
    const externalData = await externalResponse.json();
    console.log("📌 [게시판 API] 외부 API 응답 데이터:", externalData);

    return NextResponse.json(externalData, { status: 200 });
  } catch (error) {
    console.error("🚨 [게시판 API] 서버 오류 발생:", error);
    return NextResponse.json(
      {
        isSuccess: false,
        code: "COMMON500",
        message: "🚨 서버 내부 오류 발생",
      },
      { status: 500 }
    );
  }
}

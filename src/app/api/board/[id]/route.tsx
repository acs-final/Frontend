import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // ✅ Next.js 타입 추가

type CreateCommentRequest ={
  content: string;
  score: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 동적 매개변수를 비동기적으로 받아옵니다.
  const { id } = await params;

  try {
    const response = await fetch(`http://192.168.2.141:8080/v1/bookstore/${id}`);

    // 외부 API가 에러 상태 코드를 반환할 경우 에러를 발생시킵니다.
    if (!response.ok) {
      throw new Error(`외부 API 응답 상태: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // 오류 로그 출력
    console.error('데이터 요청 중 오류 발생:', error);
    return NextResponse.json(
      { error: '데이터를 가져오지 못했습니다.' },
      { status: 500 }
    );
  }
}


// import { NextResponse } from "next/server";


export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    console.log("📌 [게시판 API] 댓글 추가 요청 수신");

    const { params } = context;
    const id = params?.id; // ✅ `id`가 `undefined`가 아닌지 확인
    if (!id) {
      throw new Error("❌ 게시글 ID가 없습니다.");
    }

    // 요청 데이터 받기
    const reqBody = await request.json();
    console.log("📌 [게시판 API] 요청 데이터:", reqBody);

    const { content, score } = reqBody;
    if (!content || score == null) {
      console.warn("❌ 댓글 내용과 점수가 비어 있습니다.");
      return NextResponse.json(
        { isSuccess: false, code: "COMMON400", message: "❌ 댓글 내용과 점수를 입력하세요." },
        { status: 400 }
      );
    }

    // ✅ 외부 API URL 설정
    const externalApiUrl = `http://192.168.2.141:8080/v1/comment/${id}`;

    // ✅ 외부 API로 요청 보내기
    console.log(`📌 [게시판 API] 외부 API 요청: ${externalApiUrl}`);
    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, score }),
    });

    if (!externalResponse.ok) {
      console.warn("❌ 외부 API 응답 실패:", externalResponse.status);
      return NextResponse.json(
        { isSuccess: false, code: "COMMON500", message: "❌ 외부 API 호출 실패" },
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
      { isSuccess: false, code: "COMMON500", message: "🚨 서버 내부 오류 발생" },
      { status: 500 }
    );
  }
}

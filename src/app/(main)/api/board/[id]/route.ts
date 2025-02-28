import { NextResponse } from 'next/server';
import type { NextRequest } from "next/server"; // ✅ Next.js 타입 추가


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 동적 매개변수를 비동기적으로 받아옵니다.
  const { id } = await params;
  // 환경 변수에서 외부 API 기본 URL을 불러오거나, 기본값으로 'http://192.168.2.141:8080/v1' 사용
  const externalApiUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";

  try {
    // GET 요청은 '/bookstore' 엔드포인트를 사용합니다.
    const url = `${externalApiUrl}/bookstore/${id}`;
    const response = await fetch(url);

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 이제 params를 await로 사용하여 게시글 ID를 받아올 수 있습니다.
  const { id } = await params;
  if (!id) {
    throw new Error("❌ 게시글 ID가 없습니다.");
  }

  const reqBody = await request.json();

  const { content, score } = reqBody;
  if (!content || score == null) {
    return NextResponse.json(
      {
        isSuccess: false,
        code: "COMMON400",
        message: "❌ 댓글 내용과 점수를 입력하세요.",
      },
      { status: 400 }
    );
  }

  const externalApiUrl =
    process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
  const externalResponse = await fetch(`${externalApiUrl}/comment/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  const externalData = await externalResponse.json();

  return NextResponse.json(externalData, { status: 200 });
}

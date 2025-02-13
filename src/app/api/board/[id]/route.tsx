import { NextResponse } from 'next/server';

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
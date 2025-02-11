import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const externalUrl = `http://192.168.2.141:8080/v1/bookstore/`;

  try {
    const response = await fetch(externalUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "외부 요청 실패" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API 라우트 에러:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

export async function DELETE(request: Request) {
  try {
    // 클라이언트에서 전달한 JSON 본문에서 boardId 추출
    const { boardId } = await request.json();

    if (!boardId) {
      return NextResponse.json(
        { error: "boardId가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // 외부 API에 DELETE 요청 보내기 (boardId만으로 요청)
    const externalResponse = await fetch(`http://192.168.2.141:8080/v1/bookstore/${boardId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!externalResponse.ok) {
      throw new Error(`외부 API 삭제 실패: ${externalResponse.status}`);
    }

    const result = await externalResponse.json();

    return NextResponse.json({ isSuccess: true, result }, { status: 200 });
  } catch (error) {
    console.error("게시글 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "게시글 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

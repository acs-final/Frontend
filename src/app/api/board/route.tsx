import { NextRequest, NextResponse } from "next/server";

// 환경 변수로부터 외부 API Base URL을 불러오고, 없을 경우 기본 URL 사용
const apiBaseUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
// board 리소스 경로를 추가 (EXTERNAL_API_URL에는 board 경로가 포함되어 있지 않으므로 추가)
const boardApiUrl = `${apiBaseUrl.replace(/\/$/, "")}/board`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // 동적 파라미터 id를 사용하여 특정 board 데이터를 가져옴.
    const response = await fetch(`${boardApiUrl}/${params.id}`);
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

    // board 리소스 경로를 포함하여 외부 API에 DELETE 요청 보내기
    const externalResponse = await fetch(`${boardApiUrl}/${boardId}`, {
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

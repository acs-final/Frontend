// app/api/deletereport/[id]/route.tsx (Next.js App Directory 방식)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // params는 Promise이므로 await를 통해 구조 분해합니다.
    const { id: reportId } = await params;

    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value;

    // 추가 데이터가 필요한 경우 request body 파싱 (필요 없다면 제거 가능)
    const reqBody = await request.json();
    console.log("reqBody:", reqBody);

    // 변경된 부분: EXTERNAL_API_URL를 기본 URL로 사용하고, '/reports/${reportId}' 경로를 추가함
    const externalApiBase = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    const externalApiUrl = `${externalApiBase}/reports/${reportId}`;

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie ?? "",
      },
      // 필요한 경우 request 데이터를 body에 포함시키세요.
      body: JSON.stringify(reqBody),
    });
    console.log("externalResponse:", externalResponse);

    if (!externalResponse.ok) {
      console.log(
        "외부 API 응답 상태:",
        externalResponse.status,
        externalResponse.statusText
      );
      throw new Error("외부 API 호출에 실패했습니다.");
    }

    // 응답 객체를 클론하여 로그에 사용
    const clonedResponse = externalResponse.clone();
    const responseText = await clonedResponse.text();
    console.log("external API 응답 body:", responseText);

    // 원본 응답 객체에서 JSON 데이터 읽기
    const externalData = await externalResponse.json();

    return NextResponse.json({
      isSuccess: externalData.isSuccess,
      code: externalData.code,
      message: externalData.message,
      result: externalData.result,
    });
  } catch (error) {
    console.error("독후감 삭제 중 에러:", error);
    if (error instanceof Error) {
      console.error("에러 메시지:", error.message);
    }
    return NextResponse.json(
      { isSuccess: false, message: error instanceof Error ? error.message : "알 수 없는 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
  
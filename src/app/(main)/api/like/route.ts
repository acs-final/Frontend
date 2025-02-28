import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    console.log("🔹 /api/like route.ts 진입");

    // 쿠키에서 memberId 가져오기
    const cookieStore = await cookies();
    const memberCookie = cookieStore.get("memberCookie")?.value || "";
    console.log("🟢 memberCookie:", memberCookie);

    // 클라이언트 요청 데이터 파싱
    let reqBody;
    try {
      reqBody = await request.json();
    } catch (jsonError) {
      console.error("❌ JSON 파싱 오류:", jsonError);
      return NextResponse.json({ isSuccess: false, message: "Invalid JSON request body" }, { status: 400 });
    }

    const { fairytaleId } = reqBody;
    console.log("📌 reqBody:", reqBody);
    console.log("📌 fairytaleId:", fairytaleId);

    if (typeof fairytaleId !== "number") {
      console.error("❌ Invalid fairytaleId:", fairytaleId);
      return NextResponse.json({ isSuccess: false, message: "Invalid fairytaleId" }, { status: 400 });
    }

    // 환경 변수에서 API URL 가져오기
    const baseApiUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    const externalApiUrl = `${baseApiUrl.replace(/\/$/, "")}/fairytale/likes`;

    console.log("🔗 외부 API URL:", externalApiUrl);

    // 외부 API 호출
    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "memberId": memberCookie, // ✅ 쿠키 값 전달
      },
      body: JSON.stringify({ fairytaleId }),
    });

    console.log("🟠 externalResponse Status:", externalResponse.status);

    if (!externalResponse.ok) {
      console.error("🔴 외부 API 응답 오류:", externalResponse.status, externalResponse.statusText);
      const errorText = await externalResponse.text(); // 상세한 에러 메시지 확인
      console.error("🔴 외부 API 응답 본문:", errorText);
      throw new Error(`외부 API 호출 실패 (Status: ${externalResponse.status})`);
    }

    // 외부 API 응답 데이터 파싱
    const externalData = await externalResponse.json();
    console.log("🔹 외부 API 응답:", externalData);

    // 성공 응답 반환
    return NextResponse.json({
      isSuccess: externalData.isSuccess,
      code: externalData.code,
      message: externalData.message,
      result: externalData.result,
    });

  } catch (error) {
    console.error("🔥 좋아요 요청 중 오류 발생:", error);

    return NextResponse.json(
      { isSuccess: false, message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

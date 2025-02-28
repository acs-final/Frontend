import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // params를 Promise로 명시
) {
  const params = await context.params; // params를 await로 해결
  const id = params.id;
  const externalApiUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
  const externalUrl = `${externalApiUrl}/fairytale/${id}`;
  console.log("book route call");

  try {
    const response = await fetch(externalUrl);
    if (!response.ok) {
      throw new Error(`External API error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching external API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
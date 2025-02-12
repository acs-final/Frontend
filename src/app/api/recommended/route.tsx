import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch('http://192.168.2.141:8080/v1/fairytale/top');
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: '추천 도서를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

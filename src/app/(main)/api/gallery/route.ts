export async function GET(request: Request) {
    // 외부 API URL 설정 (환경변수가 없으면 기본값 사용)
    const externalApiUrl = process.env.EXTERNAL_API_URL || "http://192.168.2.141:8080/v1";
    const externalUrl = `${externalApiUrl}/fairytale/`;
  
    try {
      const response = await fetch(externalUrl);
      const data = await response.json();
  
      // 외부 API의 응답을 그대로 반환합니다.
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error fetching gallery:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
  
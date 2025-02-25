"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// 불필요한 부분을 제거하는 유틸 함수
function cleanLine(line: string) {
  let cleaned = line;
  // 1) 중괄호 제거
  cleaned = cleaned.replace(/[{}]/g, "");
  // 2) 특정 키워드(page, title, body, prompt, fairytaleId) 제거
  cleaned = cleaned.replace(/\b(page|title|body|prompt|fairytaleId)\b["\s:]*/gi, "");
  // 3) 따옴표 제거
  cleaned = cleaned.replace(/"/g, "");
  // 4) 남은 중복 공백 정리
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

function LoadingPageContent() {
  const [data, setData] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsStreaming(true);

      // URL 쿼리 파라미터에서 값 추출
      const genre = searchParams.get("genre") || "";
      const gender = searchParams.get("gender") || "";
      const challenge = searchParams.get("challenge") || "easy";

      console.log("genre:", genre);
      console.log("gender:", gender);
      console.log("challenge:", challenge);

      const response = await fetch("/api/loading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          genre,
          gender,
          challenge,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) {
        console.error("ReadableStream을 가져올 수 없습니다.");
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            setIsStreaming(false);
            break;
          }
          // 수신된 청크를 문자열로 디코딩
          const chunkValue = decoder.decode(value, { stream: true });
          // SSE는 '\n' 단위로 "event:" 또는 "data:" 등이 나뉘므로 줄 단위로 처리
          const lines = chunkValue.split("\n");

          const cleanedLines = lines.map((line) => {
            const trimmed = line.trim();
            // event: 로 시작하는 줄은 무시
            if (trimmed.startsWith("event:")) {
              return "";
            }
            // data: 로 시작하면 data: 제거 후 처리
            if (trimmed.startsWith("data:")) {
              let raw = trimmed.replace("data:", "").trim();
              raw = raw.replace(/\\n/g, "\n").replace(/\\"/g, '"');
              raw = cleanLine(raw);
              return raw;
            }
            return "";
          });

          const finalChunkValue = cleanedLines.join(" ");
          setData((prev) => prev + " " + finalChunkValue);
        }
      } catch (error) {
        console.error("스트리밍 중 오류 발생:", error);
        setIsStreaming(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // 스트리밍 완료 후, data에 "스트리밍 완료 [숫자]" 패턴이 있으면 리다이렉트
  useEffect(() => {
    if (!isStreaming && data) {
      // 예: "스트리밍 완료 128" 에서 128 추출
      const match = data.match(/스트리밍\s*완료\s*(\d+)/);
      if (match && match[1]) {
        router.push(`/booktest/${match[1]}`);
      }
    }
  }, [isStreaming, data, router]);

  return (
    <div>
      <h3>실시간 스트리밍 데이터</h3>
      {/* 요청한 데이터를 화면에 출력 */}
      <div style={{ whiteSpace: "pre-wrap" }}>{data}</div>
      {isStreaming && <p>스트리밍 중...</p>}
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoadingPageContent />
    </Suspense>
  );
}

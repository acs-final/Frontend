"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// 불필요한 부분을 제거하는 유틸 함수
function cleanLine(line: string) {
  let cleaned = line;
  cleaned = cleaned.replace(/[{}]/g, ""); // 중괄호 제거
  cleaned = cleaned.replace(/\b(page|title|body|prompt|fairytaleId)\b["\s:]*/gi, ""); // 특정 키워드 제거
  cleaned = cleaned.replace(/"/g, ""); // 따옴표 제거
  cleaned = cleaned.replace(/\s+/g, " ").trim(); // 중복 공백 정리
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
        body: JSON.stringify({ genre, gender, challenge }),
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
          const chunkValue = decoder.decode(value, { stream: true });
          const lines = chunkValue.split("\n");

          const cleanedLines = lines.map((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("event:")) return "";
            if (trimmed.startsWith("data:")) {
              let raw = trimmed.replace("data:", "").trim();
              raw = raw.replace(/\\n/g, "\n").replace(/\\"/g, '"');
              return cleanLine(raw);
            }
            return "";
          });

          const finalChunkValue = cleanedLines.join(" ");

          // 🔹 새로운 데이터를 추가하되, 최근 500자까지만 유지
          setData((prev) => {
            const updatedText = (prev + " " + finalChunkValue).trim();
            return updatedText.length > 500 ? updatedText.slice(-500) : updatedText;
          });
        }
      } catch (error) {
        console.error("스트리밍 중 오류 발생:", error);
        setIsStreaming(false);
      }
    };

    fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (!isStreaming && data) {
      const match = data.match(/스트리밍\s*완료\s*(\d+)/);
      if (match && match[1]) {
        router.push(`/booktest/${match[1]}`);
      }
    }
  }, [isStreaming, data, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl p-4 border rounded-md shadow-md bg-white">
        <div className="text-lg font-semibold whitespace-pre-wrap">{data}</div>
      </div>
      {isStreaming && <p className="mt-4 text-blue-500"></p>}
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

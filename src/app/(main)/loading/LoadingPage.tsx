"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// LottieLoader를 동적으로 불러오되, SSR은 하지 않도록 설정
const LottieLoader = dynamic(() => import("./Lottieloader"), { ssr: false });

function cleanLine(line: string) {
  let cleaned = line;
  cleaned = cleaned.replace(/[{}]/g, "");
  cleaned = cleaned.replace(/\b(page|title|body|prompt|fairytaleId)\b["\s:]*/gi, "");
  cleaned = cleaned.replace(/"/g, "");
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
      const genre = searchParams.get("genre") || "";
      const gender = searchParams.get("gender") || "";
      const challenge = searchParams.get("challenge") || "easy";

      console.log("genre:", genre);
      console.log("gender:", gender);
      console.log("challenge:", challenge);

      const response = await fetch("/api/loading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (match?.[1]) {
        router.push(`/booktest/${match[1]}`);
      }      
    }
  }, [isStreaming, data, router]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4">
      {/* Lottie 애니메이션 */}
      <div className="w-28 h-28 md:w-36 md:h-36 mb-4">
        <LottieLoader />
      </div>

      {/* 스트리밍 데이터 박스 */}
      <div className="w-full max-w-lg p-4 border rounded-md shadow-md bg-white text-center mb-4">
        <div className="text-lg font-semibold whitespace-pre-wrap">{data}</div>
      </div>

      {/* 스트리밍 중 표시 */}
      {isStreaming && <p className="text-blue-500">스트리밍 중...</p>}
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

"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "./loading-animation.json"; // Lottie JSON 파일

export default function LottieLoader() {
  const loadingText = "MOAI가 동화를 생성 중이에요";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const typingSpeed = 150; // 글자 추가 속도 (ms)
  const restartDelay = 1000; // 다시 시작 전 대기 시간 (ms)

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < loadingText.length) {
        setDisplayedText(loadingText.slice(0, index + 1)); // 한 글자씩 추가
        setIndex((prev) => prev + 1);
      } else {
        clearInterval(interval); // 현재 반복 종료
        setTimeout(() => {
          setDisplayedText(""); // 텍스트 초기화
          setIndex(0); // 인덱스 초기화 후 다시 시작
        }, restartDelay); // 1초 후 다시 시작
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [index]); // index가 변경될 때마다 실행

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Lottie 애니메이션 */}
      <Lottie animationData={animationData} loop autoplay className="w-52 h-52" />

      {/* 한 글자씩 나타나는 로딩 메시지 */}
      <p className="mt-4 text-lg font-semibold text-gray-700">{displayedText}</p>
    </div>
  );
}

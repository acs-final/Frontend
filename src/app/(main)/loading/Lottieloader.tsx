"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "./loading-animation.json"; // Lottie JSON 파일

export default function LottieLoader() {
  // 타이핑 효과에 사용할 문구
  const loadingText = "MOAI가 동화를 생성 중이에요";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  // 속도/재시작 딜레이 설정
  const typingSpeed = 150;   // 글자 추가 간격(ms)
  const restartDelay = 1000; // 문장 완성 후 반복 시작까지 대기(ms)

  useEffect(() => {
    // 일정 간격으로 글자를 하나씩 추가하는 interval
    const interval = setInterval(() => {
      if (index < loadingText.length) {
        // 아직 문장을 다 못 찍었다면 한 글자씩 추가
        setDisplayedText(loadingText.slice(0, index + 1));
        setIndex((prev) => prev + 1);
      } else {
        // 문장 전체를 찍었으면 interval 정리
        clearInterval(interval);

        // 1초 후에 다시 시작
        setTimeout(() => {
          setDisplayedText("");
          setIndex(0);
        }, restartDelay);
      }
    }, typingSpeed);

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Lottie 애니메이션 */}
      <Lottie 
        animationData={animationData} 
        loop 
        autoplay 
        className="w-52 h-52" 
      />

      {/* 한 글자씩 나타나는 로딩 메시지 */}
      <p className="mt-4 text-lg font-semibold text-gray-700">
        {displayedText}
      </p>
    </div>
  );
}

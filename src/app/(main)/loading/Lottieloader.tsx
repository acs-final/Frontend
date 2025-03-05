"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lottie를 동적 import (SSR 방지)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import animationData from "./loading-animation.json"; // JSON 파일

export default function LottieLoader() {
  const loadingText = "MOAI가 동화를 생성 중이에요";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const typingSpeed = 150; 
  const restartDelay = 1000; 

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < loadingText.length) {
        setDisplayedText(loadingText.slice(0, index + 1));
        setIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setDisplayedText("");
          setIndex(0);
        }, restartDelay);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [index]);

  return (
<div className="flex flex-col items-center justify-center min-h-screen">
  {/* Lottie 애니메이션 */}
  <div className="relative w-52 h-52">
    <Lottie animationData={animationData} loop autoplay />
  </div>

  {/* 한 글자씩 나타나는 로딩 메시지 */}
  <p className="mt-28 w-80 text-lg font-semibold text-gray-700 text-center break-words max-w-xs">
    {displayedText}
  </p>
</div>

  );
}

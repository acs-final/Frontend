"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, Pause } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// API 응답 구조에 맞춘 인터페이스 정의
interface Body {
  [key: string]: string;
}

interface ImageUrl {
  imageUrl: string;
}

interface Mp3Url {
  mp3Url: string;
}

interface BookData {
  fairytaleId: number;
  title: string;
  score: number;
  genre: string;
  body: Body;
  imageUrl: ImageUrl[];
  mp3Url: Mp3Url[];
}

/**
 * S3와 같이 CORS 이슈가 있는 이미지의 경우,
 * fetch를 통해 이미지를 blob으로 다운로드 받고, FileReader를 사용하여 base64 문자열로 반환합니다.
 */
const getBase64FromUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error("이미지 다운로드 실패:", error);
    return url;
  }
};

export default function BookDetailPage() {
  const { id } = useParams();
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 무한 스크롤: 현재 보여줄 페이지 수
  const [visiblePages, setVisiblePages] = useState(1);
  // 스크롤 컨테이너와 sentinel 요소용 ref
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // 현재 화면 중앙에 위치한 페이지 (오디오 제어에 사용)
  const [activePage, setActivePage] = useState(0);

  // 오디오 관련 상태
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // API 호출
  useEffect(() => {
    if (!id) return;
    async function fetchBookData() {
      try {
        const response = await fetch(`/api/book/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBookData(data.result);
      } catch (err: any) {
        console.error("GET 요청 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBookData();
  }, [id]);

  // bookData가 있을 경우, body의 키(page1, page2, …)를 정렬하여 pages 배열 구성
  const pages =
    bookData && bookData.body
      ? Object.keys(bookData.body)
          .sort(
            (a, b) =>
              parseInt(a.replace("page", "")) -
              parseInt(b.replace("page", ""))
          )
          .map((key, index) => ({
            text: bookData.body[key],
            title: bookData.title,
            image:
              bookData.imageUrl && bookData.imageUrl.length > 0
                ? bookData.imageUrl[index % bookData.imageUrl.length].imageUrl
                : "/storybook/default.png",
            audio:
              bookData.mp3Url && bookData.mp3Url.length > 0
                ? bookData.mp3Url[index % bookData.mp3Url.length].mp3Url
                : ""
          }))
      : [];

  // Intersection Observer: sentinel 요소가 컨테이너 내에 보이면 visiblePages 증가
  useEffect(() => {
    if (!sentinelRef.current || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visiblePages < pages.length) {
          setVisiblePages((prev) => Math.min(prev + 1, pages.length));
        }
      },
      {
        root: containerRef.current,
        rootMargin: "100px",
        threshold: 0.1
      }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visiblePages, pages.length]);

  // 스크롤 이벤트를 이용해 화면 중앙에 가까운 페이지를 activePage로 설정
  useEffect(() => {
    if (!containerRef.current) return;
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const pageElements = container.querySelectorAll(".page-container");
      const containerRect = container.getBoundingClientRect();
      let closestPage = 0;
      let minDistance = Infinity;
      pageElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(
          rect.top - containerRect.top - container.clientHeight / 2
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestPage = index;
        }
      });
      setActivePage(closestPage);
    };
    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [visiblePages]);

  // 오디오 재생 토글 (현재 activePage의 audio 사용)
  const toggleAudio = () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const currentAudio = pages[activePage].audio;
        if (currentAudio) {
          audioRef.current.src = currentAudio;
          audioRef.current.load();
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("오디오 재생 실패:", error);
              setIsPlaying(false);
            });
          }
        }
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("오디오 재생 중 에러:", error);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <section className="relative">
      {/* 상단 고정 헤더 (동화 제목) */}
      {/* <header className="fixed top-0 left-0 w-full bg-white z-10 p-4 shadow">
        <h2 className="text-2xl font-bold">{bookData?.title}</h2>
      </header> */}
      {/* 스크롤 가능한 컨테이너 (무한 스크롤 적용) */}
      <div
        ref={containerRef}
        className="snap-y snap-mandatory overflow-y-scroll scroll-smooth"
        style={{ height: "calc(100vh - 60px)", marginTop: "60px" }}
      >
        {pages.slice(0, visiblePages).map((page, index) => (
          <div
            key={index}
            data-index={index}
            className="page-container snap-start flex flex-col md:flex-row items-center gap-8 p-8 border-b min-h-[calc(100vh-60px)]"
          >
            {/* 동화 그림 */}
            <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center items-center">
              <img
                src={page.image}
                alt={`Illustration for page ${index + 1}`}
                className="w-3/4 max-w-lg rounded-lg shadow-md"
              />
            </div>
            {/* 동화 텍스트 및 오디오 컨트롤 */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">{page.title}</h2>
              <p className="text-lg leading-relaxed mb-4">{page.text}</p>
              {/* 현재 화면에 보이는 페이지(activePage)에서 오디오가 있다면 오디오 컨트롤 표시 */}
              {activePage === index && page.audio && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      className="audio-button flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={toggleAudio}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="flex items-center gap-2 min-w-[300px]">
                      <span className="text-sm w-12">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleTimeChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm w-12">{formatTime(duration)}</span>
                    </div>
                  </div>
                  <audio
                    ref={audioRef}
                    onLoadedMetadata={(e) =>
                      setDuration(e.currentTarget.duration)
                    }
                    onTimeUpdate={(e) =>
                      setCurrentTime(e.currentTarget.currentTime)
                    }
                    onEnded={() => {
                      setIsPlaying(false);
                      if (audioRef.current) audioRef.current.currentTime = 0;
                    }}
                    onError={(e) => {
                      console.error("오디오 로드 에러:", e);
                      setIsPlaying(false);
                    }}
                    style={{ display: "none" }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {/* 무한 스크롤 트리거 sentinel */}
        <div ref={sentinelRef} className="h-10"></div>
      </div>
      {/* 하단 버튼 그룹 (평가하기) */}
      <div className="flex justify-center gap-4 py-4 border-t border-gray-200 mt-4">
        <Link href={`/review/${bookData?.fairytaleId}`}>
          <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center">
            평가하기
          </button>
        </Link>
      </div>
    </section>
  );
}

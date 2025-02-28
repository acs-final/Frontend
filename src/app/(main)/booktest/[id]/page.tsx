"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, Pause } from "lucide-react";

// API 응답 구조에 맞춘 인터페이스 정의
interface Body {
  [key: string]: string;
}

interface ImageUrl {
  imageUrl: string | null;
}

interface Mp3Url {
  mp3Url: string | null;
}

interface BookData {
  fairytaleId: number;
  title: string;
  score: number;
  genre: string;
  likeCount: number;
  body: Body;
  imageUrl: ImageUrl[] | null;
  mp3Url: Mp3Url[] | null;
}

interface ApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: BookData;
}

export default function BookDetailPage() {
  const { id } = useParams();
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visiblePages, setVisiblePages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // 데이터가 완전히 로드되었는지 확인하는 함수
  const isDataComplete = (data: BookData | null) => {
    if (!data) return false;
    const hasBody = data.body && Object.keys(data.body).length > 0;
    const hasImages =
      data.imageUrl &&
      data.imageUrl.length > 0 &&
      data.imageUrl.every((img) => img.imageUrl !== null);
    const hasMp3s =
      data.mp3Url &&
      data.mp3Url.length > 0 &&
      data.mp3Url.every((mp3) => mp3.mp3Url !== null);
    return hasBody && hasImages && hasMp3s;
  };

  // API 호출 함수
  const fetchBookData = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/book/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      if (data.isSuccess) {
        setBookData((prev) => {
          const newData = { ...data.result };
          if (prev) {
            newData.imageUrl =
              newData.imageUrl && newData.imageUrl.some((img) => img.imageUrl)
                ? newData.imageUrl
                : prev.imageUrl;
            newData.mp3Url =
              newData.mp3Url && newData.mp3Url.some((mp3) => mp3.mp3Url)
                ? newData.mp3Url
                : prev.mp3Url;
          }
          return newData;
        });
        setLoading(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error("GET 요청 실패:", err);
      setError(err.message);
    }
  };

  // 초기 데이터 로드 및 조건부 polling
  useEffect(() => {
    fetchBookData(); // 초기 로드

    let interval: NodeJS.Timeout | null = null;
    if (!isDataComplete(bookData)) {
      interval = setInterval(() => {
        fetchBookData(); // 0.5초마다 호출
      }, 500);
    }

    // 데이터가 완전하면 interval 정리
    if (isDataComplete(bookData) && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval); // 컴포넌트 언마운트 시 정리
    };
  }, [id, bookData]); // bookData가 변경될 때마다 체크

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
                : null,
            audio:
              bookData.mp3Url && bookData.mp3Url.length > 0
                ? bookData.mp3Url[index % bookData.mp3Url.length].mp3Url
                : null,
          }))
      : [];

  // Intersection Observer 설정
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
        threshold: 0.1,
      }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visiblePages, pages.length]);

  // 스크롤 이벤트로 activePage 설정 및 오디오 로드
  useEffect(() => {
    if (!containerRef.current || !pages.length) return;

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

      if (audioRef.current && pages[closestPage].audio) {
        const currentAudio = pages[closestPage].audio;
        if (currentAudio && audioRef.current.src !== currentAudio) {
          setAudioLoaded(false);
          audioRef.current.src = currentAudio;
          console.log("오디오 소스 설정:", currentAudio);
          audioRef.current.load();
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);

    if (audioRef.current && pages[activePage]?.audio) {
      const initialAudio = pages[activePage].audio;
      audioRef.current.src = initialAudio;
      audioRef.current.load();
      console.log("초기 오디오 소스 설정:", initialAudio);
    }

    return () => container.removeEventListener("scroll", handleScroll);
  }, [pages, activePage]);

  // 오디오 재생 토글
  const toggleAudio = () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const currentAudio = pages[activePage].audio;
        if (currentAudio) {
          if (audioRef.current.src !== currentAudio) {
            audioRef.current.src = currentAudio;
            audioRef.current.load();
          }
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
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
          <div className="text-lg">로딩 중...</div>
        </div>
      )}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-red-200 bg-opacity-75">
          <div className="text-lg text-red-700">{error}</div>
        </div>
      )}
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
              {page.image ? (
                <>
                  {!imageLoaded && (
                    <div className="w-3/4 max-w-lg h-64 bg-gray-300 animate-pulse rounded-lg shadow-md"></div>
                  )}
                  <img
                    src={page.image}
                    alt={`Illustration for page ${index + 1}`}
                    className={`w-3/4 max-w-lg rounded-lg shadow-md ${
                      !imageLoaded ? "hidden" : ""
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                  />
                </>
              ) : (
                <div className="w-3/4 max-w-lg h-64 bg-gray-300 animate-pulse rounded-lg shadow-md"></div>
              )}
            </div>
            {/* 동화 텍스트 및 오디오 컨트롤 */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">{page.title}</h2>
              <p className="text-lg leading-relaxed mb-4">{page.text}</p>
              {activePage === index && (
                <div className="flex flex-col items-center gap-3">
                  {page.audio ? (
                    !audioLoaded ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 animate-pulse rounded-full"></div>
                        <div className="w-[300px] h-2 bg-gray-300 animate-pulse rounded-lg"></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          className="audio-button flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={toggleAudio}
                        >
                          {isPlaying ? (
                            <Pause size={20} />
                          ) : (
                            <Play size={20} />
                          )}
                        </button>
                        <div className="flex items-center gap-2 min-w-[300px]">
                          <span className="text-sm w-12">
                            {formatTime(currentTime)}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleTimeChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm w-12">
                            {formatTime(duration)}
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 animate-pulse rounded-full"></div>
                      <div className="w-[300px] h-2 bg-gray-300 animate-pulse rounded-lg"></div>
                    </div>
                  )}
                  {page.audio && (
                    <audio
                      ref={audioRef}
                      onLoadedMetadata={(e) => {
                        console.log("오디오 메타데이터 로드됨:", page.audio);
                        setDuration(e.currentTarget.duration);
                        setAudioLoaded(true);
                      }}
                      onTimeUpdate={(e) =>
                        setCurrentTime(e.currentTarget.currentTime)
                      }
                      onEnded={() => {
                        setIsPlaying(false);
                        if (audioRef.current) audioRef.current.currentTime = 0;
                      }}
                      onError={(e) => {
                        console.error("오디오 로드 에러:", e);
                        setAudioLoaded(true);
                        setIsPlaying(false);
                      }}
                      style={{ display: "none" }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={sentinelRef} className="h-10"></div>
      </div>
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
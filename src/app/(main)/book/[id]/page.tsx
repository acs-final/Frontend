"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, Pause } from "lucide-react";

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
        console.log("bookData:", data.result);
        setLoading(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error("GET 요청 실패:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, [id]);

  useEffect(() => {
    const pollingInterval = !isDataComplete(bookData)
      ? setInterval(() => fetchBookData(), 1000)
      : null;
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [bookData]);

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
              bookData.mp3Url &&
              bookData.mp3Url.length > 0 &&
              index < bookData.mp3Url.length
                ? bookData.mp3Url[index].mp3Url
                : null,
          }))
      : [];

  useEffect(() => {
    if (!sentinelRef.current || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visiblePages < pages.length) {
          setVisiblePages((prev) => Math.min(prev + 1, pages.length));
        }
      },
      { root: containerRef.current, rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visiblePages, pages.length]);

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
      if (closestPage !== activePage) {
        stopAudio();
        setActivePage(closestPage);
        if (pages[closestPage].audio && audioRef.current) {
          audioRef.current.src = pages[closestPage].audio as string;
          audioRef.current.load();
          console.log("Audio Source Updated:", pages[closestPage].audio);
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pages, activePage]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current || !pages[activePage].audio) {
      console.error("오디오 요소 또는 소스가 없습니다:", pages[activePage]);
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const currentAudio = pages[activePage].audio;
        if (audioRef.current.src !== currentAudio) {
          audioRef.current.src = currentAudio as string;
          audioRef.current.load();
        }
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("오디오 재생 시작:", currentAudio);
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("오디오 재생 실패:", error);
              setIsPlaying(false);
            });
        }
      }
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
    <section className="relative min-h-screen">
      {loading && <div>로딩 중...</div>}
      {error && <div>{error}</div>}

      {/* 스크롤 컨테이너 */}
      <div
        ref={containerRef}
        className="snap-y snap-mandatory overflow-y-scroll scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ height: "calc(87vh)"}} // 상단 여백 제거, 하단만 유지
      >
        {pages.slice(0, visiblePages).map((page, index) => (
          <div
            key={index}
            data-index={index}
            // className="page-container snap-start flex flex-col md:flex-row items-center gap-8 p-8 border-b min-h-[calc(85vh)]"
            className="page-container flex flex-col md:flex-row items-center gap-8 p-8 border-b h-[80vh]"
          >
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
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">{page.title}</h2>
              <p className="text-lg leading-relaxed mb-4">{page.text}</p>
            </div>
          </div>
        ))}
        <div ref={sentinelRef} className="h-10"></div>
      </div>

      {/* 고정된 하단 영역: 오디오 컨트롤과 평가하기 버튼 */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-10 flex justify-center items-center gap-8"> */}
      <div className="footer absolute left-0 right-0 p-1 z-100 h-2 flex justify-center items-center gap-8">
      {/* <div className="footer absolute bottom-0 left-0 right-0 p-4 z-10 shadow-lg bg-white justify-center items-center w-full gap-8"> */}
      {/* <div className="fixed bottom-0 flex-col left-0 right-0 bg-white p-4 shadow-lg z-10 flex justify-center items-center gap-8"> */}
        {/* 오디오 컨트롤 */}
        {pages[activePage]?.audio ? (
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
        ) : (
          <p className="text-sm text-gray-500">이 페이지에는 오디오가 없습니다.</p>
        )}

        {/* 평가하기 버튼 */}
        {bookData?.fairytaleId ? (
          <Link href={`/review/${bookData.fairytaleId}`}>
            <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center">
              평가하기
            </button>
          </Link>
        ) : (
          <p className="text-sm text-gray-500">평가할 동화가 없습니다.</p>
        )}
      </div>

      <audio
        ref={audioRef}
        onLoadedMetadata={(e) => {
          console.log("오디오 메타데이터 로드됨:", pages[activePage]?.audio);
          setDuration(e.currentTarget.duration);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
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
    </section>
  );
}
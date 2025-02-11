"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowBigRight, ArrowBigLeft, Play, Pause } from "lucide-react";

// API 응답에 따른 인터페이스 정의 (상황에 맞게 수정하세요)
interface Body {
  [key: string]: string;
}

interface BookResult {
  title: string;
  body: Body;
}

interface BookData {
  result: BookResult;
}

export default function BookDetailPage() {
  // useParams에서 id가 string | undefined 인 점을 고려
  const { id } = useParams();
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 동화책 페이지 전용 상태
  const [currentPage, setCurrentPage] = useState(0);
  // audioRef에 HTMLAudioElement 타입을 명시 (초기값은 null)
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!id) return;

    async function fetchBookData() {
      try {
        const response = await fetch(`/api/book/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBookData(data);
      } catch (err: any) {
        console.error("GET 요청 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBookData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!bookData) return <div>동화 데이터를 찾을 수 없습니다.</div>;

  // API 응답 구조에 맞게 동화 페이지 데이터를 구성합니다.
  const result = bookData.result;
  const pages =
    result && result.body
      ? Object.keys(result.body)
          .sort(
            (a, b) =>
              parseInt(a.replace("page", "")) -
              parseInt(b.replace("page", ""))
          )
          .map((key) => ({
            text: result.body[key],
            title: result.title,
            image: "/storybook/default.png", // 기본 이미지 경로 (필요에 따라 수정)
            audio: "" // 오디오 데이터가 없으므로 빈 문자열 (원하는 경우 기본 오디오 경로 지정)
          }))
      : [
          {
            text: "동화 페이지 데이터가 없습니다.",
            title: result?.title || "제목 없음",
            image: "/fallback_image.png",
            audio: ""
          }
        ];

  // 오디오 토글 함수
  const toggleAudio = () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const currentAudio = pages[currentPage].audio;
        if (currentAudio) {
          audioRef.current.src = currentAudio;
          audioRef.current.load();
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("오디오 재생 시작");
              })
              .catch((error) => {
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

  // 오디오 중지 함수
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // 다음 페이지 이동 (오디오 중지 후)
  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      stopAudio();
      setCurrentPage(currentPage + 1);
    }
  };

  // 이전 페이지 이동 (오디오 중지 후)
  const handlePrevPage = () => {
    if (currentPage > 0) {
      stopAudio();
      setCurrentPage(currentPage - 1);
    }
  };

  // 시간 포맷 함수 (분:초)
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
    <section className="p-8 relative">
      <div className="storybook mx-20 min-h-[calc(100vh-200px)] flex flex-col">
        {/* 이전 페이지 버튼 */}
        <button
          className="absolute left-0 top-2/3 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300 transition-colors"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          <ArrowBigLeft size={50} />
        </button>
        <div className="flex-1 flex flex-col md:flex-row items-center md:items-center gap-8">
          {/* 동화 그림 */}
          <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center items-center">
            <img
              src={pages[currentPage].image}
              alt="Story illustration"
              className="w-3/4 max-w-lg rounded-lg shadow-md"
            />
          </div>
          {/* 동화 텍스트 및 오디오 컨트롤 */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4">
              {pages[currentPage].title}
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              {pages[currentPage].text}
            </p>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  className="audio-button flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={toggleAudio}
                  disabled={!pages[currentPage].audio}
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
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onEnded={() => {
                  setIsPlaying(false);
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                  }
                }}
                onError={(e) => {
                  console.error("오디오 로드 에러:", e);
                  setIsPlaying(false);
                }}
              />
            </div>
          </div>
        </div>
        {/* 다음 페이지 버튼 */}
        <button
          className="absolute right-0 top-2/3 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300 transition-colors"
          onClick={handleNextPage}
          disabled={currentPage === pages.length - 1}
        >
          <ArrowBigRight size={50} />
        </button>
        {/* 하단 버튼 그룹 */}
        <div className="flex justify-center gap-4 py-4 border-t border-gray-200">
          <Link href="/review">
            <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center">
              평가하기
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowBigRight, ArrowBigLeft, Play, Pause } from "lucide-react";
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
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error("이미지 다운로드 실패:", error);
    // 에러 발생 시 원본 URL을 반환하지만, 캡쳐에 문제가 생길 수 있음
    return url;
  }
};

export default function BookDetailPage() {
  const { id } = useParams();
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 동화 페이지 전용 상태
  const [currentPage, setCurrentPage] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // PDF 내보내기에 사용할 영역 ref (원래 내용은 유지)
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchBookData() {
      try {
        const response = await fetch(`/api/book/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // result 필드 안의 데이터를 사용합니다.
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!bookData) return <div>동화 데이터를 찾을 수 없습니다.</div>;

  // 동화 데이터를 기반으로 페이지 배열 구성
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
                ? bookData.imageUrl[
                    index % bookData.imageUrl.length
                  ].imageUrl
                : "/storybook/default.png",
            audio:
              bookData.mp3Url && bookData.mp3Url.length > 0
                ? bookData.mp3Url[
                    index % bookData.mp3Url.length
                  ].mp3Url
                : ""
          }))
      : [
          {
            text: "동화 페이지 데이터가 없습니다.",
            title: bookData?.title || "제목 없음",
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

  // PDF 내보내기 함수 (수정됨)
  // 동화의 모든 페이지에 대해, S3 이미지를 다운로드 받아 base64로 변환하고,
  // 이미지와 텍스트만 포함시키도록 임시 DOM에서 캡처합니다.
  const exportToPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < pages.length; i++) {
      // 임시 컨테이너 생성 (화면에 보이지 않도록)
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-10000px";
      tempContainer.style.top = "0";
      tempContainer.style.width = "600px"; // 임의의 너비 (필요에 따라 조정)
      tempContainer.style.padding = "20px";
      tempContainer.style.fontFamily = "sans-serif";

      // 이미지 추가 (S3 링크 이미지를 base64로 다운로드)
      const img = document.createElement("img");
      const base64Image = await getBase64FromUrl(pages[i].image);
      img.src = base64Image;
      img.style.width = "100%";
      img.style.display = "block";
      img.style.marginBottom = "10px";
      tempContainer.appendChild(img);

      // 제목 추가
      const titleEl = document.createElement("h2");
      titleEl.style.fontSize = "24px";
      titleEl.style.margin = "0";
      titleEl.innerText = pages[i].title;
      tempContainer.appendChild(titleEl);

      // 텍스트 추가
      const textEl = document.createElement("p");
      textEl.style.fontSize = "16px";
      textEl.style.marginTop = "10px";
      textEl.innerText = pages[i].text;
      tempContainer.appendChild(textEl);

      document.body.appendChild(tempContainer);

      // 이미지 로드 완료 대기
      await new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

      // 렌더링 안정화를 위해 잠시 대기 (100ms)
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempContainer);
      const dataURL = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(dataURL);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(dataURL, "PNG", 0, 0, imgWidth, imgHeight);

      document.body.removeChild(tempContainer);
    }
    pdf.save("full_story.pdf");
  };

  return (
    // 기존 콘텐츠 영역(화면 구성용)
    <section className="p-8 relative" ref={contentRef}>
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
          <Link href={`/review/${bookData.fairytaleId}`}>
            <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center">
              평가하기
            </button>
          </Link>
          {/* 수정된 PDF 내보내기 버튼 */}
          {/* <button
            onClick={exportToPDF}
            className="h-9 px-4 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center"
          >
            PDF 내보내기
          </button> */}
        </div>
      </div>
    </section>
  );
}
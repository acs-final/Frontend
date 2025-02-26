"use client"; // ✅ 클라이언트 컴포넌트 설정

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/app/(main)/components/ui/input";
import { Button } from "@/app/(main)/components/ui/button";
import { Textarea } from "@/app/(main)/components/ui/textarea"
import Image from "next/image";
import { Toaster } from "@/app/(main)/components/ui/toaster"
import { toast } from "@/app/(main)/hooks/use-toast";



// ★ 전체 채워진 별 (노란색)
const FullStar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-6 h-6 text-yellow-500"
  >
    <path
      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 
         1.402 8.174L12 18.897l-7.336 3.864 
         1.402-8.174L.132 9.21l8.2-1.192L12 .587z"
      fill="currentColor"
    />
  </svg>
);

// ★ 비어있는 별 (회색 외곽선)
const EmptyStar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-6 h-6 text-gray-300"
  >
    <path
      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 
         1.402 8.174L12 18.897l-7.336 3.864 
         1.402-8.174L.132 9.21l8.2-1.192L12 .587z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

// ★ 반 채워진 별: 좌측 50%는 노란색, 우측은 비어있는 별
const HalfStar = () => (
  <div className="relative w-6 h-6">
    {/* 노란색 채움 (좌측 50%만 보임) */}
    <div className="absolute top-0 left-0 overflow-hidden" style={{ width: "50%" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-6 h-6 text-yellow-500"
      >
        <path
          d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 
             1.402 8.174L12 18.897l-7.336 3.864 
             1.402-8.174L.132 9.21l8.2-1.192L12 .587z"
          fill="currentColor"
        />
      </svg>
    </div>
    {/* 전체 비어있는 별 */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-6 h-6 text-gray-300"
    >
      <path
        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 
           1.402 8.174L12 18.897l-7.336 3.864 
           1.402-8.174L.132 9.21l8.2-1.192L12 .587z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  </div>
);

export default function ReviewPage() {
  const [rating, setRating] = useState(0); // ⭐ 실제 선택된 평점
  const [hoverRating, setHoverRating] = useState(0); // ⭐ 마우스 오버 상태
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState(""); // 추가: 제목 상태
  const [content, setContent] = useState(""); // 추가: 내용 상태
  // API에서 받아온 도서 데이터 저장
  const [bookData, setBookData] = useState<any>(null);
  // 에러 메시지 상태
  const [errorMessage, setErrorMessage] = useState("");

  // URL 파라미터에서 id 추출
  const { id } = useParams();
  // 라우터 초기화 (getcredit 이동에 사용)
  const router = useRouter();

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    if (!id) return;

    fetch(`/api/book/${id}`)
      .then((res) => {
        if (!res.ok) {
          // 응답 상태가 ok가 아니면 에러 처리
          throw new Error(`네트워크 오류: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.isSuccess) {
          setBookData(data.result);
        } else {
          console.error("도서 데이터를 불러오는데 실패했습니다.", data);
        }
      })
      .catch((err) => {
        console.error("도서 데이터를 불러오는 중 에러 발생:", err);
      });
  }, [id]);

  // API로부터 받아온 이미지 URL (없을 시 기본 이미지 사용) 및 대체 텍스트
  const coverImageSrc = bookData?.imageUrl?.[0]?.imageUrl || "/storybook/page1.png";
  const coverAlt = bookData?.title || "책 표지";

  // 현재 보여줄 평점: hover 상태가 있으면 hoverRating, 아니면 rating
  const currentRating = hoverRating || rating;

  // 별 아이콘 내부에서 마우스 클릭 위치에 따라 반/전채 선택
  const handleStarClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    star: number
  ) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width / 2) {
      setRating(star - 0.5);
    } else {
      setRating(star);
    }
  };

  // 별 아이콘 내부에서 마우스 이동 시 hoverRating 업데이트
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    star: number
  ) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width / 2) {
      setHoverRating(star - 0.5);
    } else {
      setHoverRating(star);
    }
  };

  // 별 영역을 벗어나면 hover 효과 제거
  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // 별 번호(1~5)에 따라 현재 평점에 맞는 별 모양 반환
  const renderStar = (star: number): React.ReactElement => {
    if (currentRating >= star) {
      return <FullStar />;
    } else if (currentRating >= star - 0.5) {
      return <HalfStar />;
    } else {
      return <EmptyStar />;
    }
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    setErrorMessage(""); // 이전 에러 메시지 초기화
    if (!id) {
      setErrorMessage("도서 ID가 존재하지 않습니다.");
      return;
    }

    const reviewData = {
      title: title,                // 입력받은 제목
      body: content,               // 입력받은 내용
      score: rating,               // 선택한 평점 (0.5 단위)
      fairytaleId: Number(id),     // URL 파라미터의 id (숫자로 변환)
      imageUrl: coverImageSrc,     // 책 표지 이미지 URL
    };

    try {
      const response = await fetch(`/api/review/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error(`네트워크 오류: ${response.status}`);
      }

      const result = await response.json();
      if (result.isSuccess) {
        setSubmitted(true);
        toast({
          title: "독후감이 성공적으로 제출되었습니다!",
          description: "독후감이 성공적으로 제출되었습니다!",
        });
        // 성공 시 `/getcredit` 페이지로 이동하면서 fairytaleId 쿼리 파라미터 전달
        router.push(`/getcredit?fairytaleId=${id}`);
      } else {
        console.log("독후감 제출 결과:", result);
        setErrorMessage(result.message);
        toast({
          title: result.result.message || "독후감 제출에 실패했습니다.",
        });
        // 실패 시에도 같은 방식으로 fairytaleId 전달 가능
        router.push(`/getcredit?fairytaleId=${id}`);
      }
    } catch (error) {
      console.error("독후감 제출 중 에러 발생:", error);
      setErrorMessage("독후감 제출 중 오류가 발생했습니다.");
      toast({
        title: "독후감 제출 중 오류가 발생했습니다.",
        description: "독후감 제출 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4">
      <div className="w-full max-w-7xl rounded-lg shadow-lg p-6 mx-auto flex flex-col">
        {/* 독후감 작성 제목 */}
        <h3 className="text-2xl font-bold text-center mb-4">
          독후감 작성
        </h3>

        {/* 2열 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto">
          {/* 왼쪽: 제목, 내용 */}
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                제목
              </label>
              <Input
                placeholder="책 제목을 입력하세요"
                className="w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex-grow flex flex-col">
              <label className="block text-sm font-medium mb-1">
                내용
              </label>
              <Textarea
                placeholder="독후감 내용을 작성해주세요"
                className="w-full h-80 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* 오른쪽: 이미지 미리보기, 별점 선택, 버튼 */}
          <div className="flex flex-col space-y-4">
            {/* 이미지 미리보기 */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium mb-1">
                책 표지
              </label>
              <div className="border rounded-lg overflow-hidden flex justify-center items-center p-2 w-60 h-80">
                <Image
                  src={coverImageSrc}
                  alt={coverAlt}
                  width={240}
                  height={360}
                  className="rounded-md"
                />
              </div>
            </div>

            {/* 별점 선택 (5개의 별, 0.5 단위) */}
            <div className="flex flex-col items-center space-y-2">
              <label className="block text-sm font-medium">
                평점 (0.5 단위)
              </label>
              <div
                className="flex space-x-1"
                onMouseLeave={handleMouseLeave}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className="cursor-pointer"
                    onMouseMove={(e) => handleMouseMove(e, star)}
                    onClick={(e) => handleStarClick(e, star)}
                  >
                    {renderStar(star)}
                  </div>
                ))}
              </div>
              <p className="text-sm">{rating}점 선택됨</p>
            </div>

            {/* 제출 / 취소 버튼 */}
            <div className="flex justify-center space-x-4 pt-2 mt-auto">
              <Button onClick={handleSubmit}>
                제출하기
              </Button>
              <Button onClick={() => (window.location.href = '/mybookstore')}>
                취소하기
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

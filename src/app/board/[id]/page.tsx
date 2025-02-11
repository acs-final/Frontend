"use client"; // ✅ 클라이언트 컴포넌트 설정

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react";
import Image from "next/image";



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
  const { id } = useParams();
  const [title, setTitle] = useState(""); // API로부터 가져올 제목
  const [body, setBody] = useState(""); // API로부터 가져올 내용
  const [rating, setRating] = useState(0); // ⭐ 실제 선택된 평점
  const [hoverRating, setHoverRating] = useState(0); // ⭐ 마우스 오버 상태
  const [submitted, setSubmitted] = useState(false);
  // 현재 보여줄 평점: hover 상태가 있으면 hoverRating, 아니면 rating
  const currentRating = hoverRating || rating;

  // API 호출: /api/board/[id] 에서 게시글 데이터 가져오기
  useEffect(() => {
    if (id) {
      async function fetchBoard() {
        try {
          const res = await fetch(`/api/board/${id}`);
          if (!res.ok) {
            console.error("HTTP 오류:", res.status);
            return;
          }
          const data = await res.json();
          if (data.isSuccess) {
            setTitle(data.result.title);
            setBody(data.result.body);
            setRating(data.result.score);
          } else {
            console.error("게시글 불러오기 실패:", data.message || data);
          }
        } catch (error) {
          console.error("게시글 불러오기 에러:", error);
        }
      }
      fetchBoard();
    }
  }, [id]);

  // 별 아이콘 내부에서 마우스 클릭 위치에 따라 반/전체 선택
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

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6 mx-auto flex flex-col">
        {submitted ? (
          <>
            {/* 제목 */}
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              도서 추천
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto">
              {/* 왼쪽: 제목, 내용 */}
              <div className="flex flex-col items-start space-y-6">
                <div className="self-center p-0 rounded-lg flex flex-col justify-center items-center">
                  <Badge variant="outline">
                    <DollarSign className="w-40 h-40" />
                  </Badge>
                </div>
                <div className="flex flex-col space-y-4 w-full max-w-lg">
                  {/* 추천 도서 이동 */}
                  <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-start">
                    <p className="text-lg font-semibold">크레딧을 획득하셨습니다!</p>
                    독후감을 작성하셨군요! 100 크레딧을 모으면 동화책을 생성할 수 있습니다.
                    <div className="self-end flex justify-center space-x-2">
                      <Button variant="outline" onClick={() => window.location.href = '/mypage'}>
                        닫기
                      </Button>
                      <Button onClick={() => window.location.href = '/mypage'}>
                        내 책방으로 가기
                      </Button>
                    </div>
                  </div>
                  {/* 마이페이지 이동 */}
                  <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-start">
                    <p className="text-lg font-semibold">비슷한 책을 추천받고 싶으세요?</p>
                    생성한 책과 비슷한 책을 추천해드려요!!
                    <div className="self-end flex justify-center space-x-2">
                      <Button variant="outline" onClick={() => window.location.href = '/recommended'}>
                        닫기
                      </Button>
                      <Button onClick={() => window.location.href = '/recommended'}>
                        추천받기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* 오른쪽: 이미지 미리보기, 별점 선택, 버튼 */}
              <div className="flex flex-col space-y-4">
                {/* 이미지 미리보기 */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    책 표지
                  </label>
                  <div className="border rounded-lg overflow-hidden flex justify-center items-center p-2 bg-gray-100 w-80 h-96">
                    <Image
                      src="/storybook/page1.png"
                      alt="책 표지"
                      width={240}
                      height={360}
                      className="rounded-md"
                    />
                  </div>
                </div>

                {/* 별점 선택 (5개의 별, 0.5 단위) */}
                <div className="flex flex-col items-center space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                  <p className="text-sm text-gray-500">{rating}점 선택됨</p>
                </div>

                {/* 제출 / 취소 버튼 */}
                <div className="flex justify-center space-x-4 pt-2 mt-auto">
                  <Button onClick={handleSubmit}>
                    제출하기
                  </Button>
                  <Button>
                    취소하기
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 제목 */}
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              독후감 작성
            </h3>

            {/* 2열 레이아웃 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto">
              {/* 왼쪽: 제목, 내용 */}
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    내용
                  </label> 
                  <Textarea
                    placeholder="독후감 내용을 작성해주세요"
                    className="w-full h-80 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />              
                </div>
              </div>

              {/* 오른쪽: 이미지 미리보기, 별점 선택, 버튼 */}
              <div className="flex flex-col space-y-4">
                {/* 이미지 미리보기 */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    책 표지
                  </label>
                  <div className="border rounded-lg overflow-hidden flex justify-center items-center p-2 bg-gray-100 w-60 h-80">
                    <Image
                      src="/storybook/page1.png"
                      alt="책 표지"
                      width={240}
                      height={360}
                      className="rounded-md"
                    />
                  </div>
                </div>

                {/* 별점 선택 (5개의 별, 0.5 단위) */}
                <div className="flex flex-col items-center space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                  <p className="text-sm text-gray-500">{rating}점 선택됨</p>
                </div>

                {/* 제출 / 취소 버튼 */}
                <div className="flex justify-center space-x-4 pt-2 mt-auto">
                  <Button onClick={handleSubmit}>
                    제출하기
                  </Button>
                  <Button>
                    취소하기
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

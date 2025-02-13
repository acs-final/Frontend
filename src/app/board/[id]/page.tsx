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

// 별점 점수추가
const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className="relative"
          onClick={(e) => {
            const { left, width } = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - left;
            setRating(x < width / 2 ? star - 0.5 : star); // 0.5 단위 반영
          }}
        >
          {rating >= star ? <FullStar /> : rating >= star - 0.5 ? <HalfStar /> : <EmptyStar />}
        </div>
      ))}
    </div>
  );
};



export default function ReviewPage() {
  const { id } = useParams();
  const [title, setTitle] = useState(""); // API로부터 가져올 제목
  const [body, setBody] = useState(""); // API로부터 가져올 내용
  const [rating, setRating] = useState(0); // ⭐ 실제 선택된 평점
  const [hoverRating, setHoverRating] = useState(0); // ⭐ 마우스 오버 상태
  const [imageUrl, setImageUrl] = useState(""); // API로부터 가져올 이미지 URL
  const [comment, setComment] = useState(""); // 댓글 입력 상태
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가

  // 현재 보여줄 평점: hover 상태가 있으면 hoverRating, 아니면 rating
  const currentRating = hoverRating || rating;

  // API 호출: /api/board/[id] 로 게시글 데이터 가져오기
  useEffect(() => {
    if (!id) return; // ✅ `id`가 없으면 API 호출하지 않음 (방어 코드 추가)
  
    const fetchBoard = async () => {
      try {
        console.log(`📌 [프론트엔드] 게시글 데이터 요청: /api/board/${id}`);
        
        const res = await fetch(`/api/board/${id}`);
        if (!res.ok) {
          console.error("❌ HTTP 오류:", res.status);
          return;
        }
  
        const data = await res.json();
        console.log("📌 [프론트엔드] 응답 데이터:", data);
  
        if (data.isSuccess) {
          setTitle(data.result.title);
  
          // ✅ body가 객체인지 확인 후 추출
          setBody(
            typeof data.result.body === "object" && data.result.body !== null
              ? data.result.body.text ?? "" // ✅ `text` 키가 없으면 빈 문자열 반환
              : data.result.body ?? ""
          );
  
          setRating(data.result.score ?? 0); // ✅ `score`가 없으면 기본값 0 설정
  
          // ✅ imageUrl이 존재하는지 확인 후 설정
          setImageUrl(
            typeof data.result.imageUrl === "object" && data.result.imageUrl !== null
              ? data.result.imageUrl.url ?? "/storybook/page1.png"
              : data.result.imageUrl ?? "/storybook/page1.png"
          );
        } else {
          console.error("❌ 게시글 불러오기 실패:", data.message || data);
        }
      } catch (error) {
        console.error("🚨 게시글 불러오기 에러:", error);
      }
    };
  
    fetchBoard();
  }, [id]); // ✅ `id` 값이 변경될 때만 실행
  // 댓글 별점 처리 
  const handleStarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, star: number) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    setRating(x < width / 2 ? star - 0.5 : star); // 0.5 단위로 반영
  };
  // 별 아이콘 내부에서 마우스 클릭 위치에 따라 반/전체 선택
  const handleCommentSubmit = async () => {
  if (comment.trim() === "") {
    console.warn("⚠️ 댓글 내용이 비어 있습니다.");
    return;
  }

  if (!id) {
    console.warn("⚠️ 게시글 ID가 존재하지 않습니다.");
    return;
  }

  // ✅ 요청 데이터 강제 설정 (별점 포함)
  const requestData = {
    content: comment || "기본 댓글 내용",
    score: rating ?? 0, // ⭐ 0~5점, 0.5 단위로 반영
  };

  console.log(`📌 [프론트엔드] 댓글 등록 요청: /api/comment/${id}`);
  console.log("📌 [프론트엔드] 요청 데이터:", requestData); // ✅ 데이터 확인

  try {
    const res = await fetch(`/api/comment/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("📌 [프론트엔드] 응답 상태:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ 댓글 제출 실패:", res.status);
      console.error("❌ 서버 응답 본문:", errorText);
      return;
    }

    const data = await res.json();
    console.log("✅ 댓글이 성공적으로 등록되었습니다:", data.result);
    setComment(""); // ✅ 입력 필드 초기화
    setRating(0); // ⭐ 별점 초기화
  } catch (error) {
    console.error("🚨 [프론트엔드] 댓글 제출 중 에러 발생:", error);
  }
}; 
  
  

return (
  <div className="flex flex-col items-center justify-start min-h-screen p-4">
    <div className="w-full max-w-7xl rounded-lg shadow-lg p-6 mx-auto flex flex-col">
      {/* 자유 게시판 내용 */}
      <h3 className="text-2xl font-bold text-center mb-4">자유 게시판</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto">
        {/* 왼쪽: 제목, 내용 */}
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <Input
              placeholder="책 제목을 입력하세요"
              className="w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex-grow flex flex-col">
            <label className="block text-sm font-medium mb-1">내용</label>
            <Textarea
              placeholder="독후감 내용을 작성해주세요"
              className="w-full h-80 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        {/* 오른쪽: 이미지 미리보기 */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium mb-1">책 표지</label>
            <div className="border rounded-lg overflow-hidden flex justify-center items-center p-2 bg-gray-100 w-60 h-80">
              <Image
                src={imageUrl || "/storybook/page1.png"}
                alt="책 표지"
                width={240}
                height={360}
                className="rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 댓글 입력 및 별점 선택 */}
    <div className="mt-8 w-full max-w-7xl rounded-lg shadow-lg p-6 mx-auto">
      <h3 className="text-xl font-semibold mb-4">댓글</h3>
      <Textarea
        placeholder="댓글을 입력해주세요."
        className="w-full p-3 border rounded-md resize-none"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex justify-between items-center mt-4">
        {/* ⭐ 별점 선택 UI */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium">평점:</span>
          <StarRating rating={rating} setRating={setRating} />
          <span className="text-lg">{rating.toFixed(1)} / 5</span> {/* ⭐ 별점 표시 */}
        </div>

        {/* 댓글 등록 버튼 */}
        <Button onClick={handleCommentSubmit}>댓글 등록</Button>
      </div>
    </div>
  </div>
);


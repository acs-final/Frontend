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
const StarRating = ({
  rating,
  setRating,
  readOnly = false,
}: {
  rating: number;
  setRating: (rating: number) => void;
  readOnly?: boolean;
}) => {
  return (
    <div className={`flex space-x-1 ${readOnly ? "" : "cursor-pointer"}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className="relative"
          onClick={
            !readOnly
              ? (e) => {
                  const { left, width } = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - left;
                  setRating(x < width / 2 ? star - 0.5 : star); // 0.5 단위 반영
                }
              : undefined
          }
        >
          {rating >= star ? (
            <FullStar />
          ) : rating >= star - 0.5 ? (
            <HalfStar />
          ) : (
            <EmptyStar />
          )}
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
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const [overallRating, setOverallRating] = useState(0); // 전체 평점
  const [commentRating, setCommentRating] = useState(0); // 댓글용 평점

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
          // setComments(data.result.comment.reverse());
          setComments(
            data.result.comment.reverse().map((c: any) => ({
              ...c,
              newContent: c.content, // ✅ 기존 content를 복사하여 수정 가능하도록 추가
              newScore: c.score, // ✅ 기존 score를 복사하여 수정 가능하도록 추가
              editing: false, // ✅ 기본적으로 편집 모드가 비활성화 상태
            }))
          );
          setOverallRating(data.result.score ?? 0); // 전체 평점 설정
          
        } else {
          console.error("❌ 게시글 불러오기 실패:", data.message || data);
        }
      } catch (error) {
        console.error("🚨 게시글 불러오기 에러:", error);
      }
    };
  
    fetchBoard();
  }, [id]); // ✅ `id` 값이 변경될 때만 실행
  // 댓글 삭제 함수
  const handleCommentDelete = async (commentId: string) => {
    if (!id) {
      console.warn("⚠️ 게시글 ID가 없습니다.");
      return;
    }
  
    const deleteUrl = `/api/comment/${id}/${commentId}`;
    console.log(`📌 [프론트엔드] 댓글 삭제 요청: ${deleteUrl}`);
  
    try {
      const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      console.log("📌 [프론트엔드] 응답 상태:", res.status);
  
      if (!res.ok) {
        console.error("❌ 댓글 삭제 실패:", res.status);
        return;
      }
  
      const data = await res.json();
      if (data.isSuccess) {
        console.log("✅ 댓글이 성공적으로 삭제되었습니다.");
        setComments(comments.filter((c: any) => c.commentId !== commentId));
      } else {
        console.warn("⚠️ 댓글 삭제 실패:", data.message);
      }
    } catch (error) {
      console.error("🚨 [프론트엔드] 댓글 삭제 중 에러 발생:", error);
    }
  };  

  // 댓글 별점 처리 
  const handleStarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, star: number) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    setRating(x < width / 2 ? star - 0.5 : star); // 0.5 단위로 반영
  };
  // 별 아이콘 내부에서 마우스 클릭 위치에 따라 반/전체 선택
  // handleCommentUpdate 함수 
  const handleCommentUpdate = async (commentId: string, newContent: string, newScore: number) => {
    if (!id) {
      console.warn("⚠️ 게시글 ID가 없습니다.");
      return;
    }
  
    const updateUrl = `/api/comment/${id}/${commentId}`; // ✅ API 요청 URL
    console.log(`📌 [프론트엔드] 댓글 수정 요청: ${updateUrl}`);
  
    try {
      const res = await fetch(updateUrl, {
        method: "PATCH", // ✅ `PUT` → `PATCH`로 변경
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newContent,
          score: newScore,
        }),
      });
  
      console.log("📌 [프론트엔드] 응답 상태:", res.status);
  
      if (!res.ok) {
        console.error("❌ 댓글 수정 실패:", res.status);
        return;
      }
  
      const data = await res.json();
      if (data.isSuccess) {
        console.log("✅ 댓글이 성공적으로 수정되었습니다:", data.result);
        setComments(
          comments.map((c: any) =>
            c.commentId === commentId
              ? { ...c, content: newContent, score: newScore, editing: false }
              : c
          )
        );
      } else {
        console.warn("⚠️ 댓글 수정 실패:", data.message);
      }
    } catch (error) {
      console.error("🚨 [프론트엔드] 댓글 수정 중 에러 발생:", error);
    }
  };
  

  const handleCommentSubmit = async () => {
    if (comment.trim() === "") {
      console.warn("⚠️ 댓글 내용이 비어 있습니다.");
      return;
    }
  
    if (!id) {
      console.warn("⚠️ 게시글 ID가 존재하지 않습니다.");
      return;
    }
  
    try {
      console.log(`📌 [프론트엔드] 댓글 등록 요청: /api/comment/${id}`);
      console.log("📌 [프론트엔드] 요청 데이터:", { content: comment, score: commentRating });
  
      // ✅ 서버 API(`/api/comment/${id}`)로 `POST` 요청 보내기
      const res = await fetch(`/api/comment/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          score: commentRating, // rating 대신 commentRating 사용
        }),
      });
  
      console.log("📌 [프론트엔드] 응답 상태:", res.status);
  
      if (!res.ok) {
        console.error("❌ 댓글 제출 실패:", res.status);
        return;
      }
  
      const data = await res.json();
      if (data.isSuccess) {
        console.log("✅ 댓글이 성공적으로 등록되었습니다:", data.result);
  
        // ✅ 새로운 댓글을 즉시 목록에 추가
        const newComment = {
          commentId: data.result.commentId, // API 응답에서 받은 commentId
          username: "익명 사용자", // API에서 사용자 정보를 안 주면 기본값 설정
          content: comment,
          score: commentRating,
          createdAt: new Date().toISOString(), // 현재 시간 추가
        };
  
        setComments((prevComments: any) => [newComment, ...prevComments]); // 최신 댓글이 위에 추가됨
        setComment(""); // 입력 필드 초기화
        setCommentRating(0); // commentRating 초기화
      } else {
        console.warn("⚠️ 댓글 등록 실패:", data.message);
      }
    } catch (error) {
      console.error("🚨 [프론트엔드] 댓글 제출 중 에러 발생:", error);
    }
  };
  
  

return (
  <div className="flex flex-col items-center justify-start min-h-screen p-4">
    <div className="w-full max-w-7xl rounded-lg shadow-lg p-6 mx-auto flex flex-col">
      <h3 className="text-2xl font-bold text-center mb-4">자유 게시판</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto">
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
              className="w-full h-80 p-3 border rounded-md resize-none"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

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
            {/* 전체 평점 표시 */}
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-lg font-medium">전체 평점:</span>
              <StarRating rating={overallRating} setRating={setOverallRating} readOnly />
              <span className="text-lg">{overallRating.toFixed(1)} / 5</span>
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
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium">평점:</span>
          <StarRating rating={commentRating} setRating={setCommentRating} />
          <span className="text-lg">{commentRating.toFixed(1)} / 5</span>
        </div>
        <Button onClick={handleCommentSubmit}>댓글 등록</Button>
      </div>

      {/* 댓글 목록 추가 (별점 포함) */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">댓글 목록</h3>
        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.commentId} className="p-3 border rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{c.username}</span>
                  <span className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                </div>

                {/* ✅ 댓글 내용 */}
                {c.editing ? (
                  <Textarea
                    className="w-full p-2 border rounded-md resize-none"
                    value={c.newContent}
                    onChange={(e) =>
                      setComments(
                        comments.map((comment: any) =>
                          comment.commentId === c.commentId
                            ? { ...comment, newContent: e.target.value }
                            : comment
                        )
                      )
                    }
                  />
                ) : (
                  <p className="text-gray-700">{c.content}</p>
                )}

                {/* ⭐ 댓글 평점 표시 */}
                {c.score !== null && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm font-medium">평점:</span>
                    <StarRating rating={c.score} setRating={() => {}} readOnly />
                    <span className="text-sm">{c.score.toFixed(1)} / 5</span>
                  </div>
                )}

                {/* ⭐ 수정할 평점 선택 */}
                {c.editing && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm font-medium">평점 수정:</span>
                    <StarRating
                      rating={c.newScore ?? c.score}
                      setRating={(newScore) =>
                        setComments(
                          comments.map((comment: any) =>
                            comment.commentId === c.commentId
                              ? { ...comment, newScore }
                              : comment
                          )
                        )
                      }
                    />
                    <span className="text-sm">{(c.newScore ?? c.score).toFixed(1)} / 5</span>
                  </div>
                )}

                {/* ✅ 수정 및 삭제 버튼 추가 */}
                <div className="flex justify-end space-x-2 mt-2">
                  {c.editing ? (
                    <>
                      <Button
                        onClick={() => handleCommentUpdate(c.commentId, c.newContent, c.newScore ?? c.score)}
                      >
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setComments(
                            comments.map((comment: any) =>
                              comment.commentId === c.commentId
                                ? { ...comment, editing: false, newContent: c.content }
                                : comment
                            )
                          )
                        }
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setComments(
                            comments.map((comment: any) =>
                              comment.commentId === c.commentId
                                ? { ...comment, editing: true, newContent: c.content }
                                : comment
                          )
                        )
                      }
                      >
                        수정
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleCommentDelete(c.commentId)}
                      >
                        삭제
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">아직 댓글이 없습니다.</p>
        )}
      </div>
    </div>
  </div>
);
}

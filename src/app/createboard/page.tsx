"use client"; // ✅ 클라이언트 컴포넌트 설정

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast";



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
  const router = useRouter();
  const [title, setTitle] = useState(""); // API로부터 가져올 제목
  const [body, setBody] = useState(""); // API로부터 가져올 내용
  const [rating, setRating] = useState(0); // ⭐ 실제 선택된 평점
  const [hoverRating, setHoverRating] = useState(0); // ⭐ 마우스 오버 상태
  const [imageUrl, setImageUrl] = useState(""); // API로부터 가져올 이미지 URL
  // 현재 보여줄 평점: hover 상태가 있으면 hoverRating, 아니면 rating
  const currentRating = hoverRating || rating;

  // 책 목록 관련 상태 (내 책서점 API 결과)
  const [bookList, setBookList] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  // <useToast> 훅을 통해 toast 함수를 받아옴
  const { toast } = useToast();

  // API 호출: /api/board/[id] 로 게시글 데이터 가져오기
  useEffect(() => {
    if (id) {
      async function fetchBoard() {
        try {
          const res = await fetch(`/api/board/${id}`);
          if (!res.ok) {
            console.log("HTTP 오류:", res.status);
            return;
          }
          const data = await res.json();
          console.log(data);
          if (data.isSuccess) {
            setTitle(data.result.title);

            // body가 객체라면 필요한 속성(text 등)만 추출하고, 문자열이면 그대로 사용
            setBody(
              typeof data.result.body === "object" && data.result.body !== null
                ? data.result.body.text
                : data.result.body
            );

            setRating(data.result.score);

            // imageUrl이 객체라면 필요한 속성(url 등)만 추출하고, 문자열이면 그대로 사용
            setImageUrl(
              typeof data.result.imageUrl === "object" && data.result.imageUrl !== null
                ? data.result.imageUrl.url
                : data.result.imageUrl
            );
          } else {
            console.log("게시글 불러오기 실패:", data.message || data);
          }
        } catch (error) {
          console.log("게시글 불러오기 에러:", error);
        }
      }
      fetchBoard();
    }
  }, [id]);

  // 내 책서점 API 호출: /api/mybookstore 에 GET 요청
  useEffect(() => {
    async function fetchMyBookstore() {
      try {
        const res = await fetch("/api/mybookstore");
        if (!res.ok) {
          console.log("HTTP 오류:", res.status);
          return;
        }
        const data = await res.json();
        if (data.isSuccess) {
          setBookList(data.result);
          if (data.result && data.result.length > 0) {
            // 첫 번째 책을 기본 선택값으로 설정
            setSelectedBook(data.result[0]);
            setTitle(data.result[0].title);
            setImageUrl(data.result[0].imageUrl);
          }
        } else {
          console.log("책 정보 불러오기 실패:", data.message || data);
        }
      } catch (error) {
        console.log("책 정보 불러오기 에러:", error);
      }
    }
    fetchMyBookstore();
  }, []);

  // 셀렉트 박스 값 변경 시 선택한 책으로 업데이트
  const handleSelectBook = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const book = bookList.find((item) => item.fairytaleId === selectedId);
    if (book) {
      setSelectedBook(book);
      setTitle(book.title);
      setImageUrl(book.imageUrl);
    }
  };

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

  const handleSubmit = async () => {
    // sessionStorage에서 'sub' 값을 가져와 memberId로 설정
    const memberId = sessionStorage.getItem("sub");
    console.log("memberId:", memberId);

    try {
      const response = await fetch("/api/createboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "memberId": memberId || "",
        },
        body: JSON.stringify({
          title,
          body,
          score: rating,
          fairytaleId: selectedBook ? selectedBook.fairytaleId : 0,
          imageUrl,
        }),
      });

      // 208 상태 코드 처리 추가
      if (response.status === 208) {
        toast({
          variant: "destructive",
          title: "게시글 생성 실패",
          description: "이미 생성된 게시글이 존재합니다."
        });
        return;
      }

      if (response.ok) {
        console.log(response);
        console.log("게시글 생성 성공");
        toast({
          title: "게시글 생성 성공"
        });
        // 성공 후 /board로 이동
        router.push("/board");
      } else {
        console.log("게시글 생성 실패");
        toast({
          variant: "destructive",
          title: "게시글 생성 실패",
          description: await response.text()
        });
      }
    } catch (error) {
      console.error("게시글 생성 중 에러 발생:", error);
      toast({
        variant: "destructive",
        title: "게시글 생성 실패",
        description: "게시글 생성 중 오류가 발생했습니다."
      });
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

          {/* 오른쪽: 책 선택/책 표지, 별점 선택, 버튼 */}
          <div className="flex flex-col space-y-4">
            {/* 책 선택 및 책 표지 */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium mb-1">책 선택</label>
              <select
                value={selectedBook ? selectedBook.fairytaleId : ""}
                onChange={handleSelectBook}
                className="mt-1 mb-4 border rounded-md p-2"
              >
                {bookList.map((book) => (
                  <option key={book.fairytaleId} value={book.fairytaleId}>
                    {book.title}
                  </option>
                ))}
              </select>
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

            {/* 별점 선택 (5개의 별, 0.5 단위) */}
            <div className="flex flex-col items-center space-y-2">
              <label className="block text-sm font-medium">평점 (0.5 단위)</label>
              <div className="flex space-x-1" onMouseLeave={handleMouseLeave}>
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
              <Button onClick={handleSubmit}>제출하기</Button>
              <Button onClick={() => (window.location.href = '/board')}>취소하기</Button>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

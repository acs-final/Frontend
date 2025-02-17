"use client"; // 클라이언트 컴포넌트 설정

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Book {
  fairytaleId: string;
  imageUrl?: string;
  title: string;
  // 추가 필드가 있다면 여기에 정의
}

export default function BookRecommendationPage() {
  // URL의 쿼리 파라미터에서 genre 값 추출
  const searchParams = useSearchParams();
  const genre = searchParams.get("genre");

  const [books, setBooks] = React.useState<Book[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [apiResponse, setApiResponse] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        // genre 값이 있을 경우 요청 본문에 포함합니다.
        const requestBody = genre ? { genre } : {};
        const response = await fetch("/api/books", {
          method: "POST", // POST 메서드로 body 전달
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        console.log(data);

        // API 응답 전체를 저장합니다.
        setApiResponse(data);

        // API 응답에 따른 도서 목록 설정 로직
        if (Array.isArray(data)) {
          setBooks(data);
        } else if (data && Array.isArray(data.books)) {
          setBooks(data.books);
        } else if (data && Array.isArray(data.result)) {
          setBooks(data.result);
        } else {
          setBooks([]);
        }
      } catch (err) {
        setError("도서 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [genre]); // genre 값이 변경되면 다시 호출

  if (isLoading) return <div className="text-center py-8">로딩중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <section className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 안내글 */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            yes24에서 추천받고 싶으세요?
          </h1>
        </div>

        {/* 책 추천 리스트 */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
            추천 도서 목록
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.fairytaleId}
                className="p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
              >
                <div className="flex justify-center mb-4">
                  <Image
                    src={book.imageUrl || "/placeholder-book.png"}
                    alt={book.title}
                    width={150}
                    height={200}
                    className="rounded-md"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  {book.title}
                </h3>
                <div className="flex justify-center mt-4">
                  <Button asChild>
                    <Link href={`/book/${book.fairytaleId}`}>자세히 보기</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

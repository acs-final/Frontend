"use client"; // 클라이언트 컴포넌트 설정

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Book {
  fairytaleId: string;
  imageUrl?: string;
  title: string;
  // 추가 필드가 있다면 여기에 정의
}

export default function BookRecommendationPage() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [apiResponse, setApiResponse] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/recommended");
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
  }, []);

  if (isLoading) return <div className="text-center py-8">로딩중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <section className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 안내글 */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            MOAI가 생성한 동화책과 비슷한 동화책을 추천해드려요!
          </h1>
        </div>

        {/* 추천 기준 박스
        <div className="p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">추천 기준</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center md:text-left">
              <p className="text-lg font-semibold">장르</p>
              <p className="text-lg">{criteria.category}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg font-semibold">성별</p>
              <p className="text-lg">{criteria.gender}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-lg font-semibold">테마</p>
              <p className="text-lg">{criteria.theme}</p>
            </div>
          </div>
        </div> */}

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

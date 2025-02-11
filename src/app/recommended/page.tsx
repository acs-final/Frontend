"use client"; // 클라이언트 컴포넌트 설정

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function BookRecommendationPage() {
  // 예시로 고정된 추천 기준
  const criteria = {
    category: "판타지 동화",
    gender: "여자",
    theme: "모험",
  };

  // 예시로 추천 도서 데이터
  const bookList = [
    { id: 1, title: "모험의 시작", author: "작가 A", image: "/books/book1.png" },
    { id: 2, title: "마법사의 길", author: "작가 B", image: "/books/book2.png" },
    { id: 3, title: "꿈꾸는 숲", author: "작가 C", image: "/books/book3.png" },
    
    // 필요에 따라 더 추가
  ];

  return (
    <section className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 안내글 */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            MOAI가 생성한 동화책과 비슷한 동화책을 추천해드려요!
          </h1>
        </div>

        {/* 추천 기준 박스 */}
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
        </div>

        {/* 책 추천 리스트 */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
            추천 도서 목록
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bookList.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
              >
                <div className="flex justify-center mb-4">
                  <Image
                    src={book.image}
                    alt={book.title}
                    width={150}
                    height={200}
                    className="rounded-md"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  {book.title}
                </h3>
                <p className="text-lg text-center">by {book.author}</p>
                <div className="flex justify-center mt-4">
                  <Button>자세히 보기</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

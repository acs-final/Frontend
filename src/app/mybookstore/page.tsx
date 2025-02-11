"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/components/ui/table";

export default function MyBookStorePage() {
  // 예시 데이터: 내 동화책 목록
  const [books, setBooks] = useState([
    { id: 1, title: "동화책 1", reportStatus: "작성", rating: 4 },
    { id: 2, title: "동화책 2", reportStatus: "미작성", rating: 1 },
    { id: 3, title: "동화책 3", reportStatus: "작성", rating: 5 },
  ]);

  // 선택한 행들을 관리하기 위한 상태 (체크박스)
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);

  const handleCheckboxChange = (bookId: number): void => {
    setSelectedBooks((prev: number[]) =>
      prev.includes(bookId)
        ? prev.filter((id: number) => id !== bookId)
        : [...prev, bookId]
    );
  };

  return (
    <section className="p-4 sm:p-8">
      {/* 전체 컨텐츠를 감싸는 반응형 컨테이너 */}
      <div className="mx-4 sm:mx-20 p-4 sm:p-8 rounded-lg shadow-lg">
        {/* 상단 타이틀 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">내 책방</h1>
        </div>

        {/* 검색창 및 필터 버튼 영역 (모바일에서는 세로 정렬, 데스크탑에서는 가로 정렬) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <Input placeholder="Search..." className="w-full sm:w-64" />
          <div className="flex gap-4">
            <Button>상태</Button>
            <Button>평점</Button>
          </div>
        </div>

        {/* 테이블 영역 (overflow-x-auto 로 스크롤 지원) */}
        <div className="overflow-x-auto mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    // 전체 선택/해제 로직은 필요에 따라 추가하세요.
                    disabled
                  />
                </TableHead>
                <TableHead>내 동화책 (ID)</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>독후감 작성</TableHead>
                <TableHead>평점</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedBooks.includes(book.id)}
                      onChange={() => handleCheckboxChange(book.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center">{book.id}</TableCell>
                  <TableCell className="text-center">
                    {/* 제목 클릭 시 /book/{id} 페이지로 이동 */}
                    <Link
                      href={`/book/${book.id}`}
                      className="cursor-pointer hover:underline"
                    >
                      {book.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    {book.reportStatus}
                  </TableCell>
                  <TableCell className="text-center">
                    {book.rating > 0 ? book.rating : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 하단 버튼 영역 (반응형: 모바일은 세로, 데스크탑은 가로 정렬) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <Button>독후감쓰기</Button>
          <Button>읽기</Button>
        </div>
      </div>
    </section>
  );
}

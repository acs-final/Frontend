"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// API에서 받아올 데이터의 타입 정의 (필요한 필드만)
interface Book {
  fairytaleId: number;
  title: string;
  hasReport: boolean;
  score: number;
}

export default function MyBookStorePage() {
  // 책 목록 상태를 빈 배열로 초기화
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // 선택된 동화책 ID 상태 (radio 버튼을 통해 선택)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  const router = useRouter();

  // 페이지 접근 시 API 호출하여 데이터 가져오기
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/mybookstore")
      .then((response) => response.json())
      .then((data) => {
        if (data.isSuccess) {
          // API 응답의 result 필드가 책 목록임
          setBooks(data.result);
        } else {
          setError(data.message || "데이터를 가져오는데 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("네트워크 오류 발생");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // 로딩 또는 에러 상태 처리
  if (isLoading) return <p className="p-4 sm:p-8">로딩중...</p>;
  if (error) return <p className="p-4 sm:p-8">에러: {error}</p>;

  // 읽기 버튼 클릭 시 선택된 책의 id로 /boo/[id] 페이지로 이동
  const handleReadBook = () => {
    if (selectedBookId === null) {
      alert("동화책을 선택해주세요!");
      return;
    }
    router.push(`/book/${selectedBookId}`);
  };

  // 독후감 쓰기 버튼 클릭 시 선택된 책의 id로 /review/[id] 페이지로 이동
  const handleWriteReview = () => {
    if (selectedBookId === null) {
      alert("동화책을 선택해주세요!");
      return;
    }
    router.push(`/review/${selectedBookId}`);
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

        {/* API 응답 데이터를 표시하는 테이블 영역 */}
        <div className="overflow-x-auto mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                {/* 라디오 박스를 위한 헤더 (선택) */}
                <TableHead className="text-center">선택</TableHead>
                <TableHead className="text-center">동화책 ID</TableHead>
                <TableHead className="text-center">제목</TableHead>
                <TableHead className="text-center">독후감 작성 여부</TableHead>
                <TableHead className="text-center">평점</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.fairytaleId}>
                  {/* 라디오 버튼: 선택하면 해당 동화책의 ID가 상태에 저장됨 */}
                  <TableCell className="text-center">
                    <input
                      type="radio"
                      name="selectedBook"
                      value={book.fairytaleId}
                      checked={selectedBookId === book.fairytaleId}
                      onChange={() => setSelectedBookId(book.fairytaleId)}
                    />
                  </TableCell>
                  <TableCell className="text-center">{book.fairytaleId}</TableCell>
                  <TableCell className="text-center">{book.title}</TableCell>
                  <TableCell className="text-center">
                    {book.hasReport ? "작성됨" : "미작성"}
                  </TableCell>
                  <TableCell className="text-center">
                    {book.score > 0 ? book.score : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 하단 버튼 영역 (반응형: 모바일은 세로, 데스크탑은 가로 정렬) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <Button onClick={handleWriteReview}>독후감쓰기</Button>
          <Button onClick={handleReadBook}>읽기</Button>
        </div>
      </div>
    </section>
  );
}

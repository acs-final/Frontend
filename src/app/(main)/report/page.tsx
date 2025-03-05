"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/(main)/components/ui/button";
import { Input } from "@/app/(main)/components/ui/input";
import {
  Table,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/app/(main)/components/ui/table";
import { Toaster } from "@/app/(main)/components/ui/toaster"

// XSS 방지를 위한 이스케이프 함수 추가
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default function FreeBoardPage() {
  // 초기 데이터는 빈 배열로 시작하며, API에서 받아온 데이터를 사용합니다.
  const [posts, setPosts] = useState<
    {
      id: number;
      title: string;
      writer: string;
      score: number;
      createdAt: string;
    }[]
  >([]);

  // 선택한 행들을 관리하기 위한 상태 (체크박스)
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  // useToast 훅을 통해 toast 함수 사용
  // const { toast } = useToast();

  // /api/board API로부터 데이터를 가져와서 게시글 형태로 변환하는 useEffect
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/report", {
          headers: {
            'Content-Type': 'application/json',
            // CSRF 토큰 추가 (Next.js의 기본 CSRF 보호 활용)
            'X-CSRF-Token': 'your-csrf-token'
          }
        });
        const data = await response.json();
        if (data.isSuccess) {
          const fetchedPosts = data.result.map((item: any) => ({
            id: Number(item.reportId), // 숫자형으로 명시적 변환
            title: escapeHtml(item.title), // XSS 방지
            writer: escapeHtml(item.writer), // XSS 방지
            score: Number(item.score), // 숫자형으로 명시적 변환
            createdAt: escapeHtml(item.createdAt), // XSS 방지
          }));
          setPosts(fetchedPosts);
        } else {
          console.error("게시글 불러오기 실패:", data.message);
        }
      } catch (error) {
        console.error("게시글 불러오는 중 오류 발생:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleCheckboxChange = (postId: number): void => {
    setSelectedPosts((prev: number[]) =>
      prev.includes(postId) ? prev.filter((id: number) => id !== postId) : [...prev, postId]
    );
  };

  // 선택된 게시글들을 삭제하는 핸들러
  const handleDeletePosts = async () => {
    if (selectedPosts.length === 0) return;
    
    try {
      for (const id of selectedPosts) {
        // 입력값 검증
        if (!Number.isInteger(id) || id <= 0) {
          console.error("유효하지 않은 게시글 ID:", id);
          continue;
        }

        const response = await fetch(`/api/deletereport/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // CSRF 토큰 추가
            'X-CSRF-Token': 'your-csrf-token'
          },
          body: JSON.stringify({ 
            reportId: id,
            // 추가 보안을 위한 타임스탬프
            timestamp: Date.now()
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          console.log(`게시글 ${id} 삭제 실패:`, data.error);
        }
      }
      // 삭제 후 화면에서 해당 게시글 제거
      setPosts((prevPosts) => prevPosts.filter((post) => !selectedPosts.includes(post.id)));
      setSelectedPosts([]);
    } catch (error) {
      console.error("게시글 삭제 중 오류 발생:", error);
    }
  };

  return (
    <section className="p-4 sm:p-8">
      <div className="mx-4 sm:mx-20 p-4 sm:p-8 rounded-lg shadow-lg">
        {/* 상단 타이틀 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">독후감</h1>
        </div>

        {/* 검색창 및 필터 버튼 영역 */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <Input placeholder="검색..." className="w-full sm:w-64" />
          <Button>필터</Button>
        </div>

        {/* 테이블 영역 */}
        <div className="overflow-x-auto mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center align-middle">
                  <input
                    type="checkbox"
                    // 전체 선택/해제 로직은 필요에 따라 추가하세요.
                    disabled
                  />
                </TableHead>
                <TableHead className="text-center align-middle">번호</TableHead>
                <TableHead className="text-center align-middle">제목</TableHead>
                <TableHead className="text-center align-middle">작성자</TableHead>
                <TableHead className="text-center align-middle">스코어</TableHead>
                <TableHead className="text-center align-middle">날짜</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post, index) => (
                <TableRow key={`${post.id}-${index}`}>
                  <TableCell className="text-center align-middle">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleCheckboxChange(post.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center align-middle">{post.id}</TableCell>
                  <TableCell className="text-center align-middle">
                    <Link
                      href={`/board/${post.id}`}
                      className="cursor-pointer hover:underline"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center align-middle">{post.writer}</TableCell>
                  <TableCell className="text-center align-middle">{post.score}</TableCell>
                  <TableCell className="text-center align-middle">{post.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          {/* <Link href="/createboard">
            <Button>글쓰기</Button>
          </Link> */}
          <Button onClick={handleDeletePosts}>글삭제</Button>
        </div>
        <Toaster />
      </div>
    </section>
  );
}

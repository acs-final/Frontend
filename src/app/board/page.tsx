"use client";

import { useState, useEffect } from "react";
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

export default function FreeBoardPage() {
  // 초기 데이터는 빈 배열로 시작하며, API에서 받아온 데이터를 사용합니다.
  const [posts, setPosts] = useState<
    {
      id: number;
      title: string;
      author: string;
      date: string;
      views: number;
    }[]
  >([]);

  // 선택한 행들을 관리하기 위한 상태 (체크박스)
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

  // /api/board API로부터 데이터를 가져와서 게시글 형태로 변환하는 useEffect
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/board");
        const data = await response.json();
        if (data.isSuccess) {
          // API의 result 배열 데이터를 게시글 형태로 매핑
          const fetchedPosts = data.result.map((item: any) => ({
            id: item.bookstoreId,      // 게시글 ID로 bookstoreId 사용
            title: item.title,         // 게시글 제목
            author: "작성자 정보 없음", // API에 작성자 정보가 없으므로 기본 문자열 사용
            date: "날짜 정보 없음",     // API에 작성일 정보가 없으므로 기본 문자열 사용
            views: 0,                  // API에 조회수가 없으므로 기본값 0 사용
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

  return (
    <section className="p-4 sm:p-8">
      <div className="mx-4 sm:mx-20 p-4 sm:p-8 rounded-lg shadow-lg">
        {/* 상단 타이틀 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">자유게시판</h1>
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
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    // 전체 선택/해제 로직은 필요에 따라 추가하세요.
                    disabled
                  />
                </TableHead>
                <TableHead>번호</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead>조회수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleCheckboxChange(post.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center">{post.id}</TableCell>
                  <TableCell className="text-center">
                    <Link
                      href={`/post/${post.id}`}
                      className="cursor-pointer hover:underline"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">{post.author}</TableCell>
                  <TableCell className="text-center">{post.date}</TableCell>
                  <TableCell className="text-center">{post.views}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <Button>글쓰기</Button>
          <Button>글삭제</Button>
        </div>
      </div>
    </section>
  );
}

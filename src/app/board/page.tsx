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
      writer: string;
      score: number;
      createdAt: string;
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
            id: item.bookstoreId,       // 게시글 번호로 bookstoreId 사용
            title: item.title,          // 게시글 제목
            writer: item.writer,        // 게시글 작성자
            score: item.score,          // 게시글 스코어
            createdAt: item.createdAt,  // 게시글 날짜
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
    if (selectedPosts.length === 0) {
      console.warn("삭제할 게시글을 선택하세요.");
      return;
    }
    try {
      // 선택한 게시글들의 boardId를 DELETE 요청으로 보냅니다.
      for (const id of selectedPosts) {
        const response = await fetch("/api/board", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ boardId: id }),
        });
        const data = await response.json();
        if (!response.ok) {
          console.error(`게시글 ${id} 삭제 실패:`, data.error);
        }
      }
      // 삭제된 게시글들을 화면에서 제거
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
              {posts.map((post) => (
                <TableRow key={post.id}>
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
          <Link href="/createboard">
            <Button>글쓰기</Button>
          </Link>
          <Button onClick={handleDeletePosts}>글삭제</Button>
        </div>
      </div>
    </section>
  );
}

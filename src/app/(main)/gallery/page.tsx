"use client";

import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

// API에서 받는 이미지 데이터 타입 정의
interface GalleryImage {
  fairytaleId: number;
  title: string;
  imageUrl: string;
  likeCount: number;
  isLiked?: boolean; // 좋아요 상태 추가
}

const Home: NextPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchGallery = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/gallery?page=${pageNum}&limit=10`); // 페이지와 제한 파라미터 추가
      if (res.ok) {
        const data = await res.json();
        if (data.isSuccess && Array.isArray(data.result)) {
          setImages((prev) => [...prev, ...data.result]);
          setHasMore(data.result.length === 10); // 결과가 limit과 같으면 더 있음
        }
      }
    } catch (error) {
      console.error("이미지 불러오기 에러:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchGallery(page);
  }, [fetchGallery, page]);

  // 무한 스크롤 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        !isLoading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore]);

  // 좋아요 토글 함수
  const toggleLike = async (fairytaleId: number) => {
    try {
      const res = await fetch(`/api/like/${fairytaleId}`, {
        method: "POST",
      });
      if (res.ok) {
        setImages((prev) =>
          prev.map((img) =>
            img.fairytaleId === fairytaleId
              ? {
                  ...img,
                  isLiked: !img.isLiked,
                  likeCount: img.isLiked ? img.likeCount - 1 : img.likeCount + 1,
                }
              : img
          )
        );
      }
    } catch (error) {
      console.error("좋아요 처리 에러:", error);
    }
  };

  return (
    <>
      <Head>
        <title>이미지 갤러리</title>
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          {images.map(({ fairytaleId, title, imageUrl, likeCount, isLiked }) => (
            <div key={fairytaleId} className="group relative mb-5 block w-full">
              <Link href={`/booktest/${fairytaleId}`} className="block cursor-zoom-in">
                <Image
                  alt={title}
                  className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                  src={imageUrl}
                  width={720}
                  height={480}
                  sizes="(max-width: 640px) 100vw,
                    (max-width: 1280px) 50vw,
                    (max-width: 1536px) 33vw,
                    25vw"
                />
              </Link>
              {/* 좋아요 버튼 및 카운트 */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                <button
                  onClick={() => toggleLike(fairytaleId)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-6 h-6 ${isLiked ? "text-red-500 fill-current" : "text-gray-500"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <span className="text-white text-sm bg-black bg-opacity-50 px-1 rounded">
                  {likeCount}
                </span>
              </div>
            </div>
          ))}
        </div>
        {isLoading && <p className="text-center">로딩 중...</p>}
        {!hasMore && <p className="text-center">더 이상 이미지가 없습니다.</p>}
      </main>
    </>
  );
};

export default Home;
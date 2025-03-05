"use client";

import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

// API에서 받는 이미지 데이터 타입 정의
interface GalleryImage {
  fairytaleId: number;
  title: string;
  imageUrl: string;
  likeCount: number;
  isPressed: boolean;
}

// API 페이징을 위한 타입 정의
interface PagingParams {
  page: number;
  size: number;
}

const Home: NextPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [paging, setPaging] = useState<PagingParams>({
    page: 0,
    size: 12 // 한 번에 로드할 이미지 수
  });
  
  // 마지막 이미지 요소를 참조할 ref
  const observer = useRef<IntersectionObserver | null>(null);
  const lastImageElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    // 이전 observer 연결 해제
    if (observer.current) observer.current.disconnect();
    
    // 새 observer 생성
    observer.current = new IntersectionObserver(entries => {
      // 마지막 요소가 화면에 보이고, 더 불러올 데이터가 있다면
      if (entries[0].isIntersecting && hasMore) {
        setPaging(prev => ({
          ...prev,
          page: prev.page + 1
        }));
      }
    }, {
      rootMargin: '0px 0px 200px 0px' // 하단에서 200px 전에 로딩 시작
    });
    
    // 마지막 요소 관찰 시작
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  
  // 이미지 데이터 가져오기
  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gallery?page=${paging.page}&size=${paging.size}`);
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.isSuccess && Array.isArray(data.result)) {
          // 가져온 데이터가 없거나 size보다 적으면 더 이상 데이터가 없다고 판단
          if (data.result.length === 0 || data.result.length < paging.size) {
            setHasMore(false);
          }
          
          // 중복 제거: fairytaleId 기준으로 중복 제거
          setImages(prev => {
            const newImages = [...prev];
            const uniqueIds = new Set(newImages.map(img => img.fairytaleId));
            
            data.result.forEach((img: GalleryImage) => {
              if (!uniqueIds.has(img.fairytaleId)) {
                newImages.push(img);
                uniqueIds.add(img.fairytaleId);
              }
            });
            
            return newImages;
          });
        }
      } else {
        console.error("이미지를 불러오지 못했습니다.");
        setHasMore(false);
      }
    } catch (error) {
      console.error("이미지 불러오기 에러:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [paging.page, paging.size]);
  
  // 좋아요 버튼 클릭 처리
  const handleLikeClick = async (fairytaleId: number, isPressed: boolean) => {
    try {
      const endpoint = isPressed ? '/api/dislike' : '/api/like';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fairytaleId })
      });

      if (res.ok) {
        // 좋아요 상태 업데이트
        setImages(prevImages => 
          prevImages.map(img => 
            img.fairytaleId === fairytaleId 
              ? { 
                  ...img, 
                  isPressed: !img.isPressed,
                  likeCount: img.isPressed ? img.likeCount - 1 : img.likeCount + 1
                } 
              : img
          )
        );
      } else {
        console.error("좋아요 처리 실패");
      }
    } catch (error) {
      console.error("좋아요 처리 에러:", error);
    }
  };
  
  
  // 페이지 번호가 변경될 때마다 새 데이터 로드
  useEffect(() => {
    fetchGallery();
  }, [fetchGallery, paging.page]);
  
  return (
    <>
      <Head>
        <title>이미지 갤러리</title>
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        {/* 가로 정렬을 위해 grid 레이아웃 사용 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image, index) => (
            // 마지막 요소인 경우 ref 연결
            <div
              key={`${image.fairytaleId}`}
              ref={index === images.length - 1 ? lastImageElementRef : undefined}
              className="mb-4 relative"
            >
              <Link
                href={`/book/${image.fairytaleId}`}
                className="group relative block w-full cursor-zoom-in"
              >
                <Image
                  alt={image.title}
                  className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110 h-auto w-full object-cover aspect-[3/4]"
                  src={image.imageUrl}
                  width={720}
                  height={960}
                  sizes="(max-width: 640px) 100vw,
                    (max-width: 1024px) 50vw,
                    (max-width: 1536px) 33vw,
                    25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white rounded-b-lg">
                  <h3 className="font-medium truncate">{image.title}</h3>
                </div>
              </Link>
              
              {/* 좋아요 버튼 */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLikeClick(image.fairytaleId, image.isPressed);
                }}
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md z-10 flex items-center justify-center"
                aria-label="좋아요"
              >
                {image.isPressed ? (
                  // 좋아요가 눌린 상태 - 꽉 찬 하트
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" className="w-5 h-5">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                ) : (
                  // 좋아요가 눌리지 않은 상태 - 빈 하트
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FF0000" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )}
                
                {/* 좋아요 카운트 표시 */}
                <span className="ml-1 text-xs font-medium text-gray-700">{image.likeCount}</span>
              </button>
            </div>
          ))}
        </div>
        
        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="flex justify-center my-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* 더 이상 불러올 데이터가 없는 경우 메시지 */}
        {!hasMore && images.length > 0 && (
          <div className="text-center my-8 text-gray-500">
            모든 이미지를 불러왔습니다.
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
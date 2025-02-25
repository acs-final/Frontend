"use client";

import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Bridge from "@/components/Icons/Bridge";
import Logo from "@/components/Icons/Logo";
import type { ImageProps } from "@/utils/types";
import { useLastViewedPhoto } from "@/utils/useLastViewedPhoto";

// 초기 이미지 데이터를 컴포넌트 내 상수로 정의합니다.
const initialImages: ImageProps[] = [
  {
    id: 1,
    imageUrl: "/gallery/sample1.png",
    blurDataUrl: "data:image/jpeg;base64,...",
    height: "480",
    width: "720",
    public_id: "sample1",
    format: "jpg",
  },
  {
    id: 2,
    imageUrl: "/gallery/page2.png",
    blurDataUrl: "data:image/jpeg;base64,...",
    height: "480",
    width: "720",
    public_id: "sample2",
    format: "jpg",
  },
  {
    id: 3,
    imageUrl: "/gallery/page3.png",
    blurDataUrl: "data:image/jpeg;base64,...",
    height: "480",
    width: "720",
    public_id: "sample3",
    format: "jpg",
  },
  {
    id: 4,
    imageUrl: "/gallery/page4.png",
    blurDataUrl: "data:image/jpeg;base64,...",
    height: "480",
    width: "720",
    public_id: "sample2",
    format: "jpg",
  },
  {
    id: 5,
    imageUrl: "/gallery/page5.png",
    blurDataUrl: "data:image/jpeg;base64,...",
    height: "480",
    width: "720",
    public_id: "sample3",
    format: "jpg",
  },
  {
    id: 6,
    imageUrl: "/gallery/page6.png",
    blurDataUrl: "data:image/jpeg;base64,...",
    height: "480",
    width: "720",
    public_id: "sample2",
    format: "jpg",
  },
  {
    id: 7,
    imageUrl: "/gallery/page7.png",
    blurDataUrl: "data:image/jpeg;base64,...",
    height: "480",
    width: "720",
    public_id: "sample3",
    format: "jpg",
  },
];

// 모달 대신 사용할 간단한 오버레이 컴포넌트
const ModalPlaceholder = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-md text-center">
        <p className="mb-4">여기는 모달 대체 컴포넌트입니다.</p>
        <Link
        href="/"
        shallow
        className="inline-block bg-blue-500 text-white py-2 px-4 rounded">닫기
        </Link>
      </div>
    </div>
  );
};

// HomeContent 컴포넌트는 useSearchParams()를 사용하므로 Suspense 내부에서 렌더링되어야 합니다.
function HomeContent() {
  const searchParams = useSearchParams();
  const photoId = searchParams.get("photoId");

  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

  // 무한 스크롤을 위한 상태: 이미지 배열과 현재 페이지 번호
  const [images, setImages] = useState(initialImages);
  const [page, setPage] = useState(1);
  // 스크롤 sentinel 역할을 할 div의 ref
  const loaderRef = useRef<HTMLDivElement>(null);
  const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // 모달에서 돌아올 때 마지막 본 이미지를 중앙에 위치시키는 효과
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current?.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);

  // Intersection Observer를 사용하여 로딩 sentinel이 뷰포트에 들어오면 다음 페이지 요청
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "20px",
        threshold: 1.0,
      }
    );
    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, []);

  // 페이지 번호가 증가할 때마다 새 이미지 데이터를 API를 통해 불러옴
  useEffect(() => {
    if (page === 1) return; // 초기 이미지는 이미 불러온 상태
    async function fetchMoreImages() {
      // 아래 fetch 부분은 주석 처리합니다.
      /*
      try {
        const res = await fetch(`/api/images?page=${page}`);
        if (res.ok) {
          const newImages: ImageProps[] = await res.json();
          setImages((prev) => [...prev, ...newImages]);
        }
      } catch (error) {
        console.error("이미지 불러오기 실패:", error);
      }
      */
    }
    fetchMoreImages();
  }, [page]);

  return (
    <>
      <Head>
        <title>이미지 갤러리</title>
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        {/* photoId가 있을 경우 모달 대신 대체 컴포넌트를 보여줍니다 */}
        {photoId && <ModalPlaceholder />}
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          <div className="after:content relative mb-5 flex h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="flex max-h-full max-w-full items-center justify-center">
                <Bridge />
              </span>
              <span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
            </div>
            <Logo />
            <h1 className="mt-8 mb-4 text-base font-bold uppercase tracking-widest">
              이미지 갤러리
            </h1>
            <p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
              나만의 이미지 갤러리를 만들어보세요!
            </p>
          </div>
          {images.map(({ id, imageUrl, blurDataUrl }) => (
            <Link
              key={id}
              href={`/?photoId=${id}`}
              as={`/booktest/${id}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              shallow
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
            >
              <Image
                alt="갤러리 이미지"
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: "translate3d(0, 0, 0)" }}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                src={imageUrl}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
              />
            </Link>
          ))}
          {/* 무한 스크롤을 위한 로딩 sentinel 요소 */}
          <div ref={loaderRef} className="text-center py-4">
            {/* Loading more images... */}
          </div>
        </div>
      </main>
    </>
  );
}

const Home: NextPage = () => {
  return (
    // Suspense 경계를 추가하여 useSearchParams() 사용 컴포넌트를 감쌉니다.
    <Suspense fallback={<div>Loading gallery...</div>}>
      <HomeContent />
    </Suspense>
  );
};

export default Home;

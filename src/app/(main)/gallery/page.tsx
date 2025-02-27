"use client";

import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// API에서 받는 이미지 데이터 타입 정의
interface GalleryImage {
  fairytaleId: number;
  title: string;
  imageUrl: string;
  likeCount: number;
}

const Home: NextPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          // API 응답의 형식이 { isSuccess, code, message, result }이므로 result 배열을 상태에 저장합니다.
          if (data.isSuccess && Array.isArray(data.result)) {
            setImages(data.result);
          }
        } else {
          console.error("이미지를 불러오지 못했습니다.");
        }
      } catch (error) {
        console.error("이미지 불러오기 에러:", error);
      }
    }
    fetchGallery();
  }, []);

  return (
    <>
      <Head>
        <title>이미지 갤러리</title>
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          {images.map(({ fairytaleId, title, imageUrl }) => (
            // 클릭 시 /booktest/[fairytaleId] 경로로 이동합니다.
            <Link
              key={fairytaleId}
              href={`/booktest/${fairytaleId}`}
              className="group relative mb-5 block w-full cursor-zoom-in"
            >
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
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;

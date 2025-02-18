"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fairytaleId = searchParams.get('fairytaleId'); // URL 쿼리에서 fairytaleId 추출

  useEffect(() => {
    if (fairytaleId) {
      async function fetchBook() {
        try {
          const response = await fetch(`/api/book/${fairytaleId}`);
          if (!response.ok) {
            throw new Error("네트워크 응답에 문제가 있습니다.");
          }
          const data = await response.json();
          console.log("API 응답:", data);
        } catch (error) {
          console.error("API 요청 에러:", error);
        }
      }
      fetchBook();
    }
  }, [fairytaleId]);

  const coverImageSrc = "/placeholder.jpg"; // 커버 이미지 경로
  const coverAlt = "책 표지 이미지"; // 대체 텍스트

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* 왼쪽 영역: 정보와 버튼 */}
          <div className="space-y-8">
            <div className="flex justify-center">
              <Badge variant="outline" className="p-4">
                <DollarSign className="w-20 h-20" />
              </Badge>
            </div>
            <div className="space-y-6">
              <div className="p-4">
                <p className="text-xl font-semibold">크레딧을 획득하셨습니다!</p>
                <p className="mt-2">
                  독후감을 작성하셨군요! 100 크레딧을 모으면 동화책을 생성할 수 있습니다.
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => router.push('/mypage')}>
                    닫기
                  </Button>
                  <Button onClick={() => router.push('/mybookstore')}>
                    내 책방으로 가기
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xl font-semibold">비슷한 실제책을 추천받고 싶으세요?</p>
                <p className="mt-2">
                  생성한 책과 비슷한 책을 추천해드려요!
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => router.push('/recommended')}>
                    닫기
                  </Button>
                  <Button onClick={() => router.push('/books?genre=value')}>
                    추천받기
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* 오른쪽 영역: 책 표지 이미지 */}
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium mb-2">책 표지</label>
            <div className="border rounded-lg overflow-hidden flex justify-center items-center p-2 w-80 h-96">
              <Image
                src={coverImageSrc}
                alt={coverAlt}
                width={240}
                height={360}
                className="rounded-md transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
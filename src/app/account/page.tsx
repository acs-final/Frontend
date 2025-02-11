"use client"; // 클라이언트 컴포넌트 설정

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MyPage() {
  // 상태 변수 설정
  const [nickname, setNickname] = useState("홍길동");
  const [newNickname, setNewNickname] = useState("");

  const credit = "100"; // 크레딧은 읽기 전용

  // 닉네임 변경 핸들러
  const handleNicknameChange = () => {
    if (newNickname.trim() !== "") {
      setNickname(newNickname.trim());
      setNewNickname("");
    }
  };

  return (
    <section className="p-8">
      <div className="flex">
        {/* 왼쪽 영역: 전체의 20% (프로필 버튼) */}


        {/* 오른쪽 영역: 전체의 80% (입력/선택 필드) */}
        <div className="w-4/5 p-4 space-y-6">
          {/* 닉네임 영역 */}
          <div>
            <label className="block text-lg font-semibold mb-2">닉네임</label>
            <input
              type="text"
              value={newNickname || nickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
            />
            <Button onClick={handleNicknameChange} className="mt-2">
              닉네임 변경
            </Button>
          </div>

          {/* 크레딧 영역 (읽기 전용) */}
          <div>
            <label className="block text-lg font-semibold mb-2">크레딧</label>
            <input
              type="text"
              value={credit}
              readOnly
              className="w-full border border-gray-300 p-2 rounded-md bg-gray-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

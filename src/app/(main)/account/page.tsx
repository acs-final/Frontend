"use client"; // 클라이언트 컴포넌트 설정

import { useState, useEffect } from "react";
import { Button } from "@/app/(main)/components/ui/button";

// API 응답 구조에 맞게 인터페이스 정의
interface AccountResult {
  nickname: string;
  username: string;
  credit: number;
  childAge: number;
}

interface ApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: AccountResult;
}

export default function MyPage() {
  // 계정 데이터를 저장할 상태 변수
  const [account, setAccount] = useState<AccountResult | null>(null);

  // 업데이트 가능한 입력 상태 변수 (구글 ID, 닉네임, 자녀 나이)
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [childAge, setChildAge] = useState("");

  // 배경색 상태 변수 추가
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  // 선택 가능한 색상 배열 정의
  const colors = [
    "#FFB6C1",
    "#AEC6CF",
    "#98FB98",
    "#D8BFD8",
    "#FAFAD2",
    "#FFDAB9",
    "#77DD77",
    "#D3D3D3"
  ];

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch("/api/account", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json: ApiResponse = await res.json();
        if (json.isSuccess) {
          // null 체크를 통해 기본값 할당
          setAccount({
            ...json.result,
            username: json.result.username ?? "",
            nickname: json.result.nickname ?? "",
            credit: json.result.credit ?? 0, // credit의 경우 0 또는 원하는 기본값
            childAge: json.result.childAge != null ? json.result.childAge : 0,
          });
          setUsername(json.result.username ?? "");
          setNickname(json.result.nickname ?? "");
          setChildAge(json.result.childAge != null ? String(json.result.childAge) : "");
        } else {
          console.error("API 응답 에러: ", json.message);
        }
      } catch (error) {
        console.error("데이터를 불러오는 중 에러 발생: ", error);
      }
    }
    fetchAccount();
  }, []);

  // 구글 ID, 닉네임, 자녀 나이 업데이트 핸들러
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/patchaccount", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,                // 상태에 저장된 구글 ID
          nickname,                // 업데이트할 닉네임
          childAge: Number(childAge), // 업데이트할 자녀 나이 (숫자로 변환)
          color: backgroundColor,  // color: string 타입으로 body에 담아서 전송
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json: ApiResponse = await res.json();
      if (json.isSuccess) {
        // 업데이트 성공 시 로컬 상태도 업데이트
        setAccount({
          ...account!,
          username,
          nickname,
          childAge: Number(childAge),
        });
        alert("계정정보가 업데이트되었습니다.");
      } else {
        console.error("API 응답 에러: ", json.message);
        alert("업데이트 실패: " + json.message);
      }
    } catch (error) {
      console.error("업데이트 중 에러 발생: ", error);
      alert("업데이트 중 에러 발생");
    }
  };

  // 회원 탈퇴 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 취소할 수 없습니다.")) return;
    try {
      const res = await fetch("/api/deleteaccount", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json: ApiResponse = await res.json();
      if (json.isSuccess) {
        alert("회원 탈퇴가 완료되었습니다.");
        sessionStorage.clear();
        window.location.href = "/";
      } else {
        console.error("API 응답 에러: ", json.message);
        alert("회원 탈퇴에 실패하였습니다: " + json.message);
      }
    } catch (error) {
      console.error("회원 탈퇴 중 에러 발생:", error);
      alert("회원 탈퇴 중 에러가 발생했습니다.");
    }
  };

  return (
    <section className="p-8">
      <div className="flex">
        {/* 오른쪽 영역: 계정 정보 표시 (80%) */}
        <div className="w-4/5 p-4 space-y-6">
          {account ? (
            <>
              {/* 업데이트 폼: 구글 ID, 닉네임, 자녀 나이, 배경색 */}
              <form onSubmit={handleUpdate} className="space-y-4">
                {/* 구글 ID 필드 (닉네임 위에 위치하며 수정 가능) */}
                <div>
                  <label className="block text-lg font-semibold mb-2">구글 ID</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md"
                  />
                </div>
                {/* 닉네임 필드 */}
                <div>
                  <label className="block text-lg font-semibold mb-2">닉네임</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md"
                  />
                </div>
                {/* 자녀 나이 필드 */}
                <div>
                  <label className="block text-lg font-semibold mb-2">자녀 나이</label>
                  <input
                    type="text"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md"
                  />
                </div>
                {/* 배경색 선택 필드 */}
                <div>
                  <label className="block text-lg font-semibold mb-2">배경색상</label>
                  <div className="flex space-x-4 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBackgroundColor(color)}
                        className={`w-10 h-10 rounded-full focus:outline-none ${backgroundColor === color ? "border-2 border-black" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit">업데이트</Button>
              </form>

              {/* 크레딧 정보 (읽기 전용) */}
              <div>
                <label className="block text-lg font-semibold mb-2">크레딧</label>
                <input
                  type="text"
                  value={account.credit ?? ""}
                  readOnly
                  className="w-full border border-gray-300 p-2 rounded-md"
                />
              </div>

              {/* 회원 탈퇴 버튼 */}
              <div className="mt-8">
                <Button onClick={handleDelete}>회원 탈퇴</Button>
              </div>
            </>
          ) : (
            <p>데이터를 불러오는 중...</p>
          )}
        </div>
      </div>
    </section>
  );
}

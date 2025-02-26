"use client";


export default function TermsOfService() {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">이용 약관</h1>
        <p className="text-lg leading-relaxed">
          여기에 이용 약관의 내용을 입력하세요.  
          예시: 본 서비스의 이용은 해당 약관에 동의하는 것을 전제로 하며, 사용자는 이에 따릅니다.
        </p>
        {/* 필요에 따라 세부 조항 및 추가 정보를 여기에 추가 */}
        <div className="min-h-screen flex items-center justify-center">
        <iframe
          src="/trex.html"
          style={{ width: "50%", height: "40vh", border: "none" }}
          title="T-Rex Game"
        />
    </div>
      </div>
    );
  }
  
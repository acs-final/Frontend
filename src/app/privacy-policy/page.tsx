"use client";

export default function PrivacyPolicy() {
  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <header>
        <h1 className="text-3xl font-bold mb-2">개인정보 처리방침</h1>
        <p className="text-lg leading-relaxed">최종 업데이트일: 2025년 2월 10일</p>
      </header>

      {/* 소개 */}
      <section>
        <p className="text-base leading-relaxed">
          [MOAI] (이하 &quot;회사&quot;)는 이용자의 개인정보 보호를 매우 중요하게 생각하며, &quot;정보통신망 이용촉진 및 정보보호 등에 관한 법률&quot;, &quot;개인정보 보호법&quot; 등 관련 법령을 준수하고 있습니다. 본 개인정보처리방침은 회사가 제공하는 서비스(이하 &quot;서비스&quot;)를 이용함에 있어 수집되는 개인정보의 처리 및 보호에 관한 사항을 규정합니다.
        </p>
      </section>

      {/* 1. 개인정보의 수집 및 이용 목적 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">1. 개인정보의 수집 및 이용 목적</h2>
        <p className="mb-2">회사는 수집한 개인정보를 다음의 목적을 위해 사용합니다.</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            <strong>서비스 제공 및 계약 이행:</strong> 회원 관리, 서비스 제공, 본인 확인, 콘텐츠 제공, 고객 상담 등
          </li>
          <li>
            <strong>서비스 개선 및 신규 서비스 개발:</strong> 이용자 의견 수렴, 통계 분석, 마케팅, 이벤트 안내 등
          </li>
          <li>
            <strong>법률상의 의무 이행:</strong> 관련 법령에 따른 본인 확인, 분쟁 해결, 보관 의무 이행 등
          </li>
        </ul>
      </section>

      {/* 2. 수집하는 개인정보 항목 및 수집 방법 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">2. 수집하는 개인정보 항목 및 수집 방법</h2>

        {/* (1) 수집 항목 */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-1">(1) 수집 항목</h3>
          <h4 className="font-semibold">필수항목:</h4>
          <ul className="list-disc ml-6 mb-2">
            <li>회원가입 및 서비스 이용 시: 이름, 이메일 주소, 연락처, 로그인 ID, 비밀번호 등</li>
            <li>서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보 등</li>
          </ul>
          <h4 className="font-semibold">선택항목:</h4>
          <p>서비스 이용 과정에서 자발적으로 제공되는 추가 정보(예: 관심사, 선호도 등)</p>
        </div>

        {/* (2) 수집 방법 */}
        <div>
          <h3 className="text-xl font-semibold mb-1">(2) 수집 방법</h3>
          <h4 className="font-semibold">이용자가 직접 입력:</h4>
          <p className="mb-2">회원가입, 게시물 등록, 고객 상담, 이벤트 참여 등</p>
          <h4 className="font-semibold">자동 수집:</h4>
          <p>쿠키(cookie), 방문 기록, 접속 로그, IP 주소 등</p>
        </div>
      </section>

      {/* 3. 개인정보의 보유 및 이용 기간 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">3. 개인정보의 보유 및 이용 기간</h2>
        <p className="mb-2">
          회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우에는 아래와 같이 일정 기간 보유합니다.
        </p>
        <ul className="list-disc ml-6">
          <li>
            <strong>회원가입 및 계약 관련 정보:</strong> 회원 탈퇴 또는 계약 종료 후 5년 (전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령에 따름)
          </li>
          <li>
            <strong>기타 관련 법령에 의한 보존:</strong> 관계 법령에서 정한 기간 동안 보존 후 파기
          </li>
        </ul>
      </section>

      {/* 4. 개인정보의 제3자 제공 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">4. 개인정보의 제3자 제공</h2>
        <p className="mb-2">
          회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다.
        </p>
        <ul className="list-disc ml-6">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 의거하거나, 수사 목적으로 법원 또는 정부기관의 요청이 있는 경우</li>
        </ul>
      </section>

      {/* 5. 개인정보의 파기 절차 및 방법 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">5. 개인정보의 파기 절차 및 방법</h2>
        <p className="mb-2">
          회사는 개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우, 해당 정보를 다음의 절차 및 방법에 따라 파기합니다.
        </p>
        <h3 className="text-xl font-semibold mb-1">파기 절차</h3>
        <p className="mb-2">
          파기 사유가 발생한 개인정보를 별도의 데이터베이스(DB)로 옮긴 후, 해당 DB 내에서 일정 기간(예: 30일) 보관 후 완전 삭제합니다.
        </p>
        <h3 className="text-xl font-semibold mb-1">파기 방법</h3>
        <ul className="list-disc ml-6">
          <li><strong>전자적 파일:</strong> 복구 불가능한 방법으로 영구 삭제</li>
          <li><strong>종이 문서:</strong> 분쇄하거나 소각</li>
        </ul>
      </section>

      {/* 6. 개인정보 보호를 위한 기술적·관리적 대책 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">6. 개인정보 보호를 위한 기술적·관리적 대책</h2>
        <p className="mb-2">
          회사는 이용자의 개인정보를 안전하게 관리하기 위하여 다음과 같은 대책을 시행하고 있습니다.
        </p>
        <h3 className="text-xl font-semibold mb-1">기술적 대책</h3>
        <ul className="list-disc ml-6 mb-2">
          <li>개인정보 암호화 (SSL, AES 등)</li>
          <li>접근 통제 시스템 운영</li>
          <li>보안 솔루션 적용 및 정기적인 취약점 점검</li>
        </ul>
        <h3 className="text-xl font-semibold mb-1">관리적 대책</h3>
        <ul className="list-disc ml-6">
          <li>개인정보 보호를 위한 내부 교육 및 관리 시스템 운영</li>
          <li>개인정보 취급자에 대한 최소한의 권한 부여 및 접근 제한</li>
        </ul>
      </section>

      {/* 7. 이용자의 권리와 행사 방법 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">7. 이용자의 권리와 행사 방법</h2>
        <p className="mb-2">
          이용자는 언제든지 본인의 개인정보에 대해 아래의 권리를 행사할 수 있습니다.
        </p>
        <h3 className="text-xl font-semibold mb-1">정보 열람 및 정정</h3>
        <p className="mb-2">본인의 개인정보 열람, 수정, 삭제 요청</p>
        <h3 className="text-xl font-semibold mb-1">처리 정지 및 동의 철회</h3>
        <p className="mb-2">개인정보의 처리 정지 요청 및 동의 철회</p>
        <p>
          <strong>절차 및 방법:</strong> 개인정보 관련 문의는 아래 &quot;개인정보 보호책임자&quot;에게 연락 주시면 지체 없이 조치하겠습니다.
        </p>
      </section>

      {/* 8. 개인정보 자동 수집 장치(쿠키)의 운용 및 거부 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">
          8. 개인정보 자동 수집 장치(쿠키)의 운용 및 거부
        </h2>
        <p className="mb-2">
          <strong>쿠키의 사용 목적:</strong> 이용자 식별, 맞춤형 서비스 제공, 통계 분석 등
        </p>
        <p>
          <strong>쿠키 거부 방법:</strong> 이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
        </p>
      </section>

      {/* 9. 개인정보 보호책임자 및 담당자 연락처 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">9. 개인정보 보호책임자 및 담당자 연락처</h2>
        <p className="mb-2">
          회사는 이용자의 개인정보 보호 관련 문의 및 불만 처리 등을 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
        </p>
        <h3 className="text-xl font-semibold mb-1">개인정보 보호책임자</h3>
        <ul className="list-disc ml-6 mb-2">
          <li>
            <strong>성명:</strong> 김원영
          </li>
          <li>
            <strong>직책:</strong> 대리
          </li>
          <li>
            <strong>연락처:</strong> support@moai.com
          </li>
        </ul>
        <h3 className="text-xl font-semibold mb-1">기타 개인정보 관련 문의</h3>
        <p>고객센터: support@moai.com</p>
      </section>

      {/* 10. 개인정보처리방침의 변경 */}
      <section>
        <h2 className="text-2xl font-bold mb-2">10. 개인정보처리방침의 변경</h2>
        <p>
          회사는 법령 및 내부 정책에 따라 개인정보처리방침을 변경할 수 있으며, 변경 사항은 서비스 내 공지사항 또는 홈페이지를 통해 사전에 고지합니다. 중요한 내용의 변경이 있을 경우 별도의 동의를 받을 수 있습니다.
        </p>
      </section>

      {/* 부칙 */}
      <section>
        <p>
          <strong>부칙:</strong> 본 개인정보처리방침은 2025년 2월 10일부터 적용됩니다.
        </p>
      </section>
    </div>
  );
}
  
// 🚀 서버 전용 코드 (클라이언트 코드와 충돌 방지)
export const dynamic = "force-dynamic";

// 🚀 클라이언트 컴포넌트 불러오기
import LoadingPage from "./LoadingPage"; 

export default function Page() {
  return <LoadingPage />;
}

export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="ko">
        <body>
          {/* 이곳에는 기본 레이아웃과 다른 독립적인 레이아웃 구성 */}
          <main className="auth-container">
            {children}
          </main>
        </body>
      </html>
    );
  }
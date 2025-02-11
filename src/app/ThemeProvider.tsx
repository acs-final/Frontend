// app/ThemeProvider.tsx
"use client"; // 클라이언트 전용 컴포넌트임을 명시합니다.

import { ThemeProvider } from "next-themes";
import React from "react";

export function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}

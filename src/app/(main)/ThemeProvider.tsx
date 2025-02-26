"use client";

import { ThemeProvider } from "next-themes";
import React, { useEffect, useState } from "react";

export function ThemeProviderWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="light" style={{ colorScheme: "light" }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

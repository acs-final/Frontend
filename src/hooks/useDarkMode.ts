import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function useDarkMode() {
  const { theme, systemTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // theme이 system일 경우 systemTheme을 사용하고, 
    // 그렇지 않으면 현재 theme을 사용
    const currentTheme = theme === 'system' ? systemTheme : theme;
    setIsDarkMode(currentTheme === 'dark');
  }, [theme, systemTheme]);

  return isDarkMode;
} 
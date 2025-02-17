"use client";

import { useEffect } from "react";

export default function SetBackground() {
  useEffect(() => {
    const color = sessionStorage.getItem("color");
    if (color) {
      document.body.style.backgroundColor = color;
    }
  }, []);

  return null;
} 
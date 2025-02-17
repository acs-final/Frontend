"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form"

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // sessionStorage에서 "accesstoken"을 확인하고, 값이 있으면 대시보드로 이동합니다.
    // const color = sessionStorage.getItem("color");
    const sub = sessionStorage.getItem("sub");
    // console.log("루트 page color:", color);
    // console.log("token:", token);
    // console.log("sub:", sub);

    if (sub) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

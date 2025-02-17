import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image가 허용할 외부 이미지 도메인 목록
    domains: ["moai-bucket.s3.ap-northeast-2.amazonaws.com", "image.yes24.com"],
  },
  /* config options here */
};

export default nextConfig;

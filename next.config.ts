import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // next/image가 허용할 외부 이미지 도메인 목록
    domains: [
      "moai-bucket.s3.ap-northeast-2.amazonaws.com",
      "image.yes24.com",
    ],
  },
  /* 추가 설정이 있다면 여기에 작성 */
};

export default nextConfig;

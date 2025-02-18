import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 사용하지 않는 변수에 대해 경고를 제거합니다.
      "@typescript-eslint/no-unused-vars": "off",
      // any 타입 사용에 대해 경고를 발생하지 않도록 설정
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;

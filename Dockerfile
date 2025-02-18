# 1단계: 빌드 단계 
FROM node:23-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_REDIRECT_URI
ENV NEXT_PUBLIC_REDIRECT_URI=$NEXT_PUBLIC_REDIRECT_URI

# package.json 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 전체 복사 및 빌드 실행
COPY . .
RUN npm run build

# 2단계: 실행 단계 (standalone 모드 사용)
FROM node:23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# standalone 모드로 빌드된 파일만 복사
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static/ ./.next/static/

# 필요한 경우 public 폴더와 package.json도 복사 (standalone 모드에서는 package.json을 참조할 수 있음)
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "server.js"]


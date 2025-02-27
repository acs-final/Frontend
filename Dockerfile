# 1단계: 빌드 단계 (빌드 전용 환경)
FROM node:23-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_REDIRECT_URI
ENV NEXT_PUBLIC_REDIRECT_URI=$NEXT_PUBLIC_REDIRECT_URI

# package.json 및 package-lock.json 복사 (캐시 최적화)
COPY package*.json ./

# 의존성 설치 (개발용 패키지는 제외)
RUN npm install --legacy-peer-deps --production

# 소스 전체 복사 및 빌드 실행
COPY . .
RUN npm run build

# 2단계: 실행 단계 (최소한의 실행 환경)
FROM node:23-alpine AS runner
WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production
ENV OTEL_SERVICE_NAME=frontend-service
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://opentelemetry-collector.monitoring:4317

# HTTPS 통신을 위한 인증서 패키지 추가 (필요시)
RUN apk add --no-cache ca-certificates

# standalone 모드로 빌드된 파일만 복사 (node_modules 제외)
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static/ ./.next/static/
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tracer.js ./

# 실행 환경에서만 필요한 의존성 다시 설치 (최소한의 패키지만 포함)
RUN npm install --production

# 포트 노출
EXPOSE 3000

# 실행 명령어
CMD ["npm", "run", "start"]

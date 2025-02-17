# 1단계: 빌드 단계
FROM node:18-alpine AS builder
WORKDIR /app

# 의존성 설치를 위한 파일 복사 (package.json과 lock 파일)
COPY package*.json ./

# 의존성 설치 (yarn을 사용하는 경우: RUN yarn install)
RUN npm install

# 소스 코드 전체 복사
COPY . .

# Next.js 빌드 (next.config.js가 있다면 설정도 반영됨)
RUN npm run build

# 2단계: 실행 단계
FROM node:18-alpine AS runner
WORKDIR /app

# 환경 변수를 production으로 설정
ENV NODE_ENV production

# 빌드된 결과물을 복사
COPY --from=builder /app ./

# 컨테이너가 사용할 포트 번호 지정 (Next.js 기본 포트는 3000)
EXPOSE 3000

# 컨테이너 실행 시 시작 명령어
CMD ["npm", "start"]

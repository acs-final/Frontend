// LoadingPage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
// import LoadingPage from '@/app/loading';
import LoadingPage from '@/app/loading/page';
import { useSearchParams, useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// next/navigation 모듈 모킹
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe('LoadingPage 컴포넌트 테스트', () => {
  test('스트리밍 데이터를 받고 완료 후 지정된 경로로 라우팅한다', async () => {
    // 1. useRouter 모킹: push 함수 설정
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    // 2. useSearchParams 모킹: URL 쿼리 파라미터 값 설정
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        switch (key) {
          case 'genre':
            return 'action';
          case 'gender':
            return 'male';
          case 'challenge':
            return 'easy';
          default:
            return null;
        }
      },
    });

    // 3. fetch 모킹: 스트리밍되는 청크 데이터를 순차적으로 반환
    global.fetch = jest.fn().mockResolvedValue({
      body: {
        getReader: () => {
          let count = 0;
          return {
            read: async () => {
              count++;
              if (count === 1) {
                // 첫 번째 청크
                return {
                  value: new TextEncoder().encode('data: first chunk\n'),
                  done: false,
                };
              }
              if (count === 2) {
                // 스트리밍 완료 메시지 (예: "스트리밍 완료 123")
                return {
                  value: new TextEncoder().encode('data: 스트리밍 완료 123\n'),
                  done: false,
                };
              }
              // 마지막: 스트리밍 완료
              return { value: undefined, done: true };
            },
          };
        },
      },
    });

    // 4. 컴포넌트 렌더링
    render(<LoadingPage />);

    // 5. 초기 화면 확인: "실시간 스트리밍 데이터"와 "스트리밍 중..." 문구가 표시되는지
    expect(screen.getByText('실시간 스트리밍 데이터')).toBeInTheDocument();
    expect(screen.getByText('스트리밍 중...')).toBeInTheDocument();

    // 6. 스트리밍 완료 후, router.push가 '/booktest/123'으로 호출되는지 확인
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/booktest/123');
    });
  });
});

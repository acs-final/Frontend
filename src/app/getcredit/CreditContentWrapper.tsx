"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// ssr: false 옵션을 사용하여 클라이언트에서만 CreditContent를 임포트합니다.
const CreditContent = dynamic(() => import('./CreditContent'), {
  ssr: false,
});

export default function CreditContentWrapper() {
  return <CreditContent />;
} 
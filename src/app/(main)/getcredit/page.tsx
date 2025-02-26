import React, { Suspense } from 'react';
import CreditContentWrapper from './CreditContentWrapper';

export default function GetCreditPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <CreditContentWrapper />
    </Suspense>
  );
}
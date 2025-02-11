// app/ClientProviders.tsx
"use client";

import { AuthProvider  } from "react-oidc-context";
import React from "react";

// OIDC 설정 (예시 - 실제 값은 본인의 Cognito/Google 설정에 맞게 수정)
const oidcConfig = {
  authority: "https://your-cognito-domain.auth.ap-northeast-2.amazoncognito.com",
  client_id: "YOUR_CLIENT_ID",
  redirect_uri: "http://localhost:3000/cognitoresponse",
  response_type: "code",
  scope: "openid profile email",
  // 필요시 additional 설정들을 추가합니다.
};

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider  {...oidcConfig}>{children}</AuthProvider >;
}

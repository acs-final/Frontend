"use client";
import { AuthProvider } from "react-oidc-context";

// OpenID Connect 설정 값
const oidcConfiguration = {
  client_id: "49iv39u15m9vmm6tpme3eiab4n",
  redirect_uri: "http://localhost:3000/auth-callback",
  silent_redirect_uri: "http://localhost:3000/silent-renew",
  post_logout_redirect_uri: "http://localhost:3000/",
  authority:
    "https://ap-northeast-2x2xbvfd6t.auth.ap-northeast-2.amazoncognito.com",
  scope: "openid profile email",
};

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider {...oidcConfiguration}>{children}</AuthProvider>;
} 
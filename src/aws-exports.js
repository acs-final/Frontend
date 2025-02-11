// 예: src/aws-exports.js 또는 초기화 파일에서
import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'ap-northeast-2',             // 예: 서울 리전
    userPoolId: 'ap-northeast-2_XXXXXXX',   // 생성한 User Pool ID
    userPoolWebClientId: 'XXXXXXXXXXXXXX',  // 앱 클라이언트 ID
    // OAuth 설정 (Hosted UI 사용 시)
    oauth: {
      domain: 'your-cognito-domain.auth.ap-northeast-2.amazoncognito.com',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'https://your-app-domain.com/',
      redirectSignOut: 'https://your-app-domain.com/',
      responseType: 'code' // 또는 'token'
    }
  }
});

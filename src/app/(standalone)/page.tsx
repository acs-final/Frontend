// "use client";

// import { useState } from "react";
// import { Auth, Amplify } from "aws-amplify";
// import awsConfig from "../aws-exports"; // 설정 파일 경로에 맞게 수정하세요.
// import { useRouter } from "next/navigation";

// // Amplify 초기화
// Amplify.configure(awsConfig);

// export default function LoginPage() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const user = await Auth.signIn(username, password);
//       console.log("로그인 성공:", user);
//       // 로그인 성공 후 원하는 페이지로 이동
//       router.push("/");
//     } catch (err: any) {
//       console.error("로그인 실패:", err);
//       setError(err.message || "로그인 중 오류가 발생했습니다.");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "100px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
//       <h1 style={{ textAlign: "center" }}>로그인</h1>
//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: 12 }}>
//           <label htmlFor="username" style={{ display: "block", marginBottom: 4 }}>
//             사용자 이름
//           </label>
//           <input
//             type="text"
//             id="username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             style={{ width: "100%", padding: 8 }}
//             required
//           />
//         </div>
//         <div style={{ marginBottom: 12 }}>
//           <label htmlFor="password" style={{ display: "block", marginBottom: 4 }}>
//             비밀번호
//           </label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             style={{ width: "100%", padding: 8 }}
//             required
//           />
//         </div>
//         {error && (
//           <p style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
//             {error}
//           </p>
//         )}
//         <button type="submit" style={{ width: "100%", padding: 10, fontSize: 16 }}>
//           로그인
//         </button>
//       </form>
//     </div>
//   );
// }

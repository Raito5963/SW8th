"use client";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase.config"; // Firebaseの認証設定をインポート

const LoginPage = () => {
  const [user, setUser] = useState<any>(null); // ユーザー情報を管理
  const [loading, setLoading] = useState(false); // ローディング状態を管理

  const handleLogin = async () => {
    if (loading) return;  // すでに処理中の場合は何もしない

    try {
      setLoading(true); // ローディング開始
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // ユーザー情報を取得
      setUser(user); // ユーザー情報を状態に保存
    } catch (error) {
      if ((error as any).code === 'auth/cancelled-popup-request') {
        console.error("ポップアップがキャンセルされました");
      } else {
        console.error("ログイン中にエラーが発生しました", error);
      }
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  return (
    <div>
      {!user ? (
        <div>
          <button onClick={handleLogin} disabled={loading}>
            {loading ? "ログイン中..." : "Googleでログイン"}
          </button>
        </div>
      ) : (
        <div>
          <h2>ようこそ、{user.displayName}さん</h2>
          <p>Email: {user.email}</p>
          <p>ログイン成功しました。</p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

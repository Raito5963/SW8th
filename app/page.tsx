"use client";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase.config"; // Firebaseの認証設定をインポート
import { Box, Button, Typography, useMediaQuery } from "@mui/material";

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

  // useMediaQueryを使って、モバイルサイズを判定
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        maxWidth: 400,
        margin: 'auto',
      }}
    >
      {!user ? (
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            onClick={handleLogin} 
            disabled={loading} 
            variant="contained" 
            color="primary" 
            fullWidth
          >
            {loading ? "ログイン中..." : "Googleでログイン"}
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
            ようこそ、{user.displayName}さん
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Email: {user.email}
          </Typography>
          <Typography variant="body1">
            ログイン成功しました。
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LoginPage;

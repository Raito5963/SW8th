"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../../firebase.config";
import {
  Avatar,
  Box,
  Button,
  Typography,
  createTheme,
  ThemeProvider,
  Link,
} from "@mui/material";

const theme = createTheme();

const LoginPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/cancelled-popup-request"
      ) {
        console.error("ポップアップがキャンセルされました");
      } else {
        console.error("ログイン中にエラーが発生しました", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          maxWidth: 400,
          margin: "auto",
        }}
      >
        {!user ? (
          // ログインしていない場合の表示
          <Box sx={{ textAlign: "center" }}>
            <Button
              onClick={handleLogin}
              disabled={loading}
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                padding: { xs: "8px", sm: "12px" },
              }}
            >
              {loading ? "ログイン中..." : "Googleでログイン"}
            </Button>
          </Box>
        ) : (
          // ログインしている場合の表示
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
              gutterBottom
            >
              ようこそ、{user.displayName || "ゲスト"}さん
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
              gutterBottom
            >
              Email: {user.email}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              {/* ユーザーアイコンを表示 */}
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || "ゲスト"}
                sx={{
                  width: 64,
                  height: 64,
                  marginRight: 2,
                  backgroundColor: "primary.main",
                }}
              />
              <Button
                variant="contained"
                color="primary"
                LinkComponent={Link}
                href="/home"
              >
                ホームへ
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;

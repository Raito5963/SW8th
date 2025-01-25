"use client";

import { useState, useEffect } from "react";
import { Avatar, Button, Container, Typography, Paper, Link, Box } from "@mui/material";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.config"; // Firebase の設定をインポート
import Search from "./_components/Search";

export default function Home() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // ユーザー情報を更新
        });

        return () => unsubscribe(); // クリーンアップでリスナー解除
    }, []);

    return (
        <Container>
            <Box>
                {user ? (
                    // ユーザーがログインしている場合の表示
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            src={user.photoURL || undefined}
                            alt={user.displayName || "ゲスト"}
                            sx={{
                                width: 40,
                                height: 40,
                                marginRight: 1,
                                cursor: "pointer",
                            }}
                            onClick={() => alert("プロフィールページへのリンクを設定してください")}
                        />
                        <Typography variant="body1">
                            {user.displayName || "ゲスト"}
                        </Typography>
                    </Box>
                ) : (
                    // ユーザーがログインしていない場合の表示
                    <Link href="/login" underline="none">
                        ログイン
                    </Link>
                )}
            </Box>

            <Search />

            <Box>
                <Link href="/threads/create" underline="none">
                    新規スレッド・投稿
                </Link>
                <a> | </a>
                <Link href="/threads" underline="none">
                    スレッド一覧
                </Link>
            </Box>

            <Box>
                <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                    <Typography variant="h4">新着ブログ</Typography>
                    <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                        {/* 新着順に横スクロール */}
                    </Paper>
                </Paper>
            </Box>

            <Box>
                <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                    <Typography variant="h4">最近入室したスレッド</Typography>
                    <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                        {/* 新着順に横スクロール */}
                    </Paper>
                </Paper>
            </Box>
        </Container>
    );
}

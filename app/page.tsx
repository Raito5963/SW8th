"use client";

import { useState, useEffect } from "react";
import { Avatar, Container, Typography, Paper, Link, Box } from "@mui/material";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.config"; // Firebase の設定をインポート
import Search from "./_components/Search";
import Latest from "./_components/latest"; // 最新ブログのコンポーネントをインポート
import Visited from "./_components/visited"; // 最近入室したスレッドのコンポーネントをインポート
import Latest2 from "./_components/latest2"; // 最近入室したスレッドのコンポーネントをインポート
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
                            onClick={() => window.location.href = `/${user.uid}`}
                        />
                        <Typography variant="body1">
                            <Link href={`/${user.uid}`}>{user.displayName || "ゲスト"}</Link>
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
                <Link href="/explain" underline="none">
                    このアプリの使い方はこちら
                </Link>
                <Typography variant="h4">メニュー</Typography>
                <Link href="/threads/create" underline="none">
                    新規スレッド・投稿
                </Link>
                <a> | </a>
                <Link href="/threads" underline="none">
                    スレッド一覧
                </Link>
                <br />
                <br />
                <Link href="/blogs/create" underline="none">
                    新規ブログ・投稿
                </Link>
                <a> | </a>
                <Link href="/blogs" underline="none">
                    ブログ一覧
                </Link>
            </Box>
            
            <Box>
                <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                    <Typography variant="h4">新着スレッド</Typography>
                    <Latest2 />
                </Paper>
            </Box>

            <Box>
                <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                    <Typography variant="h4">新着ブログ</Typography>
                    <Latest />
                </Paper>
            </Box>

            <Box>
                <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                    <Typography variant="h4">最近入室したスレッド</Typography>
                    <Visited />
                </Paper>
            </Box>
        </Container>
    );
}

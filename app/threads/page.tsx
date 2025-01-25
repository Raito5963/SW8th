"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase.config"; // Firebase設定ファイルのインポート
import { collection, getDocs, Timestamp } from "firebase/firestore";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Search from "../_components/Search";
interface Thread {
  id: string;
  title: string;
  description: string;
  createdAt: Timestamp; // FirestoreのTimestamp型に変更
}

const ThreadList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchThreads = async () => {
      const querySnapshot = await getDocs(collection(db, "threads"));
      const threadsData: Thread[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Thread[];
      setThreads(threadsData);
    };

    fetchThreads();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
      <Search />
      {threads.map((thread) => (
        <Card
          key={thread.id}
          sx={{
            width: "100%",
            maxWidth: 600, // デスクトップの最大幅
            margin: 2,
            "@media (max-width: 600px)": {
              margin: 1,
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" }, // モバイルとデスクトップでフォントサイズを変更
              }}
            >
              {thread.title}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                marginBottom: 2,
                fontSize: { xs: "0.875rem", sm: "1rem" }, // 説明文もレスポンシブ対応
              }}
            >
              {thread.description}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/threads/${thread.id}`)}
              sx={{
                width: "100%",
                "@media (min-width: 600px)": {
                  width: "auto",
                },
              }}
            >
              詳細を見る
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

const App = () => {
  // MUI用テーマの作成
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <ThreadList />
    </ThemeProvider>
  );
};

export default App;

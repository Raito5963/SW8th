"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase.config"; // Firebase設定をインポート
import { Box, Typography, Paper, CircularProgress, Link } from "@mui/material";

interface Thread {
  id: string;
  title: string;
  createdAt: string;
}

const LatestThreads: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestThreads = async () => {
      try {
        const q = query(
          collection(db, "threads"),
          orderBy("createdAt", "desc"),
          limit(3) // 最新3件を取得
        );
        const querySnapshot = await getDocs(q);
        const fetchedThreads: Thread[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          createdAt: doc.data().createdAt.toDate().toLocaleString(),
        }));
        setThreads(fetchedThreads);
      } catch (error) {
        console.error("スレッド取得中にエラーが発生しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestThreads();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {threads.length === 0 ? (
        <Typography>現在、スレッドはありません。</Typography>
      ) : (
        threads.map((thread) => (
          <Paper
            key={thread.id}
            elevation={3}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Link href={`/threads/${thread.id}`}>
              <Typography
                variant="h6"
                sx={{
                  cursor: "pointer",
                  color: "primary.main",
                  textDecoration: "underline",
                }}
              >
                {thread.title}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary">
              作成日時: {thread.createdAt}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default LatestThreads;

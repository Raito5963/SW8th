"use client";
import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

interface Thread {
  id: string;
  title: string;
  description: string;
}

const RecentThreads = () => {
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const router = useRouter();

  useEffect(() => {
    const threads = JSON.parse(localStorage.getItem("visitedThreads") || "[]");
    setRecentThreads(threads);
  }, []);

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {recentThreads.map((thread) => (
        <Card key={thread.id} sx={{ width: "100%", maxWidth: 600, marginBottom: 2 }}>
          <CardContent>
            <Typography variant="h6">{thread.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
              {thread.description}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/threads/${thread.id}`)}
            >
              詳細を見る
            </Button>
          </CardContent>
        </Card>
      ))}
      {recentThreads.length === 0 && (
        <Typography color="text.secondary">最近訪れたスレッドはありません。</Typography>
      )}
    </Box>
  );
};

export default RecentThreads;

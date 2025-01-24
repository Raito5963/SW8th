"use client";
import { useState, useEffect } from "react";
import { db } from "../../firebase.config"; // Firebase設定ファイルのインポート
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, Typography, Button, Box, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

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

  // useMediaQueryを使って、モバイルサイズを判定
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      {threads.map((thread) => (
        <Card key={thread.id} sx={{ width: isMobile ? '100%' : 600, margin: 2 }}>
          <CardContent>
            <Typography variant={isMobile ? "h6" : "h5"}>{thread.title}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 2 }}>
              {thread.description}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/threads/${thread.id}`)}
              fullWidth={isMobile}
            >
              詳細を見る
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ThreadList;

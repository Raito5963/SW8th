"use client";
import { useState, useEffect } from "react";
import { db } from "../../firebase.config"; // Firebase設定ファイルのインポート
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

interface Thread {
  id: string;
  title: string;
  description: string;
  createdAt: any;
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
    <div>
      {threads.map((thread) => (
        <Card key={thread.id} sx={{ margin: 2 }}>
          <CardContent>
            <Typography variant="h5">{thread.title}</Typography>
            <Typography variant="body1" color="text.secondary">
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
    </div>
  );
};

export default ThreadList;

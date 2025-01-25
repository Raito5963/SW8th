"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase.config"; // Firebase 設定ファイル
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { Card, CardContent, Typography, Box, Button, TextField } from "@mui/material";

interface Thread {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

const RecentThreads = () => {
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージから最近のスレッド情報を取得
    const storedThreads = localStorage.getItem("recentThreads");
    if (storedThreads) {
      const parsedThreads = JSON.parse(storedThreads).map((thread: any) => ({
        ...thread,
        createdAt: new Date(thread.createdAt), // createdAt を Date 型に変換
      }));
      setRecentThreads(parsedThreads);
    }
  }, []);

  const handleVisitThread = async (threadId: string) => {
    // Firestore からスレッド情報を取得
    const docRef = doc(db, "threads", threadId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const threadData = {
        id: threadId,
        title: docSnap.data().title,
        description: docSnap.data().description,
        createdAt: new Date(docSnap.data().createdAt.toDate()),
      } as Thread;

      // 履歴を更新
      const updatedThreads = [
        threadData,
        ...recentThreads.filter((t) => t.id !== threadId),
      ].slice(0, 3);
      setRecentThreads(updatedThreads);
      localStorage.setItem("recentThreads", JSON.stringify(updatedThreads));

      // スレッド詳細ページに移動
      router.push(`/threads/${threadId}`);
    } else {
      alert("スレッドが見つかりませんでした");
    }
  };

  const handleCreateThread = async () => {
    if (!title || !description) {
      alert("タイトルと説明を入力してください");
      return;
    }

    // Firestore にスレッドを作成
    const docRef = await addDoc(collection(db, "threads"), {
      title,
      description,
      createdAt: Timestamp.now(),
    });

    const threadData = {
      id: docRef.id,
      title,
      description,
      createdAt: new Date(),
    } as Thread;

    // 履歴を更新
    const updatedThreads = [
      threadData,
      ...recentThreads.filter((t) => t.id !== docRef.id),
    ].slice(0, 3);
    setRecentThreads(updatedThreads);
    localStorage.setItem("recentThreads", JSON.stringify(updatedThreads));

    // フィールドをクリア
    setTitle("");
    setDescription("");
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", p: 2 }}>
      {recentThreads.length > 0 ? (
        recentThreads.map((thread) => (
          <Card
            key={thread.id}
            sx={{
              marginBottom: 2,
              cursor: "pointer",
              "&:hover": { boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" },
            }}
            onClick={() => handleVisitThread(thread.id)}
          >
            <CardContent>
              <Typography variant="h6">{thread.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {thread.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                作成日: {thread.createdAt.toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography color="text.secondary">最近入室したスレッドはありません。</Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push("/threads")}
        sx={{ mt: 2 }}
      >
        スレッド一覧へ
      </Button>
    </Box>
  );
};

export default RecentThreads;

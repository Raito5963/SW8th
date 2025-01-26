"use client";
import { useState, useEffect } from "react";
import { db } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Link
} from "@mui/material";
import { useRouter } from "next/navigation";
import Search from "../_components/Search";

const ThreadList: React.FC = () => {
  interface Thread {
    id: string;
    title: string;
    description: string;
    visitedAt: string;
  }
  
  const [threads, setThreads] = useState<Thread[]>([]);
  const [visitedThreads, setVisitedThreads] = useState<Thread[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchThreads = async () => {
      const querySnapshot = await getDocs(collection(db, "threads"));
      setThreads(
        querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            visitedAt: "",
          };
        })
      );
    };

    fetchThreads();

    // ローカルストレージから訪問履歴を取得
    const storedVisitedThreads = JSON.parse(localStorage.getItem("visitedThreads") || "[]");
    setVisitedThreads(storedVisitedThreads);
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Search />
      <br />
      <Link href="/threads/create">
        新規スレッド作成
      </Link>
      <Link href="/">
        トップページへ
      </Link>

      {/* 訪問履歴セクション */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        直近で訪れたスレッド
      </Typography>
      {visitedThreads.map((thread) => (
        <Card
          key={thread.id}
          sx={{ mb: 2, cursor: "pointer" }}
          onClick={() => router.push(`/threads/${thread.id}`)}
        >
          <CardContent>
            <Typography variant="h6">{thread.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {thread.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              訪問日時: {new Date(thread.visitedAt).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
      <Divider sx={{ my: 4 }} />

      {/* スレッド一覧セクション */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        スレッド一覧
      </Typography>
      {threads.map((thread) => (
        <Card
          key={thread.id}
          sx={{ mb: 2 }}
          onClick={() => router.push(`/threads/${thread.id}`)}
        >
          <CardContent>
            <Typography variant="h6">{thread.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {thread.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ThreadList;

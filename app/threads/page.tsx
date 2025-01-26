"use client";
import { useState, useEffect } from "react";
import { db } from "../../firebase.config";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
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
    createdAt: string;
    latestMessage?: string; // 最新メッセージを格納するプロパティを追加
  }

  const [threads, setThreads] = useState<Thread[]>([]);
  const [visitedThreads, setVisitedThreads] = useState<Thread[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchThreads = async () => {
      const threadsRef = collection(db, "threads");
      const q = query(threadsRef, orderBy("createdAt", "desc")); // 作成日でスレッドを降順に並べる
      const querySnapshot = await getDocs(q);

      const threadsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const threadData = doc.data();
        const threadId = doc.id;
        
        // スレッドごとの最新メッセージを取得
        const messagesRef = collection(db, "threads", threadId, "messages");
        const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"), limit(1)); // 最新のメッセージを取得
        const messagesSnapshot = await getDocs(messagesQuery);
        const latestMessage = messagesSnapshot.docs.length > 0 ? messagesSnapshot.docs[0].data().content : null;

        return {
          id: threadId,
          title: threadData.title,
          description: threadData.description,
          createdAt: threadData.createdAt.toDate().toLocaleString(), // 作成日を文字列としてフォーマット
          latestMessage, // 最新メッセージを追加
        };
      }));

      setThreads(threadsData);
    };

    fetchThreads();

    const fetchVisitedThreads = async () => {
      // localStorageから訪問履歴を取得し、最新メッセージを加える
      // もし訪問履歴にスレッドがあれば、最新メッセージを取得して保存
      interface VisitedThread {
        id: string;
        title: string;
        description: string;
        createdAt: string;
      }

      interface VisitedThreadWithMessage extends VisitedThread {
        latestMessage?: string;
      }

      const storedVisitedThreads: VisitedThread[] = JSON.parse(localStorage.getItem("visitedThreads") || "[]");

      const visitedThreadsWithMessages: VisitedThreadWithMessage[] = await Promise.all(storedVisitedThreads.map(async (thread: VisitedThread) => {
        const messagesRef = collection(db, "threads", thread.id, "messages");
        const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"), limit(1));
        const messagesSnapshot = await getDocs(messagesQuery);
        const latestMessage = messagesSnapshot.docs.length > 0 ? messagesSnapshot.docs[0].data().content : null;

        return {
          ...thread,
          latestMessage, // 最新メッセージを追加
        };
      }));

      setVisitedThreads(visitedThreadsWithMessages);
    };

    fetchVisitedThreads();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Search />
      <br />
      <Link href="/threads/create">
        新規スレッド作成
      </Link>
      <a> | </a>
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
            {thread.latestMessage && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                最新の投稿: {thread.latestMessage}
              </Typography>
            )}
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
            <Typography variant="caption" color="text.secondary">
              投稿日: {thread.createdAt}
            </Typography>
            {thread.latestMessage && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                最新の投稿: {thread.latestMessage}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ThreadList;

"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // useRouterとuseParamsをインポート
import { db } from "../../../firebase.config"; // Firebase設定ファイルのインポート
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { TextField, Button, Card, CardContent, Typography, Box, useMediaQuery } from "@mui/material";
import { Timestamp } from "firebase/firestore";

interface Thread {
  id: string;
  title: string;
  description: string;
  createdAt: Timestamp; // FirestoreのTimestamp型に変更
}

interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: Timestamp; // FirestoreのTimestamp型に変更
}

const ThreadDetail = () => {
  const router = useRouter();
  const { threadId } = useParams(); // useParamsからthreadIdを取得
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    // threadIdがある場合にスレッドを取得
    if (threadId) {
      const fetchThread = async () => {
        const docRef = doc(db, "threads", threadId as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setThread({
            id: docSnap.id,
            ...docSnap.data(),
          } as Thread);
        } else {
          console.log("スレッドが見つかりません");
        }
      };

      const fetchMessages = () => {
        const messagesRef = collection(db, "threads", threadId as string, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        onSnapshot(q, (querySnapshot) => {
          const messagesData: Message[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            sender: doc.data().sender,
            content: doc.data().content,
            createdAt: doc.data().createdAt as Timestamp, // FirestoreのTimestamp型に変更
          }));
          setMessages(messagesData);
        });
      };

      fetchThread(); // スレッド情報を取得
      fetchMessages(); // メッセージ情報を取得
    }
  }, [threadId]); // threadIdが変わったときに再実行

  const handleSendMessage = async () => {
    if (newMessage.trim() && threadId) {
      const messageRef = collection(db, "threads", threadId as string, "messages");
      await addDoc(messageRef, {
        sender: "User", // ユーザー名を変更できます
        content: newMessage,
        createdAt: new Date(),
      });
      setNewMessage(""); // メッセージ送信後に入力欄をクリア
    }
  };

  const handleCreateThread = async () => {
    const newThread = {
      title: "新しいスレッド",
      description: "これは新しいスレッドの説明です。",
      createdAt: new Date(),
      creator: "User1", // ユーザー名やユーザーIDを使用
    };

    try {
      const docRef = await addDoc(collection(db, "threads"), newThread);
      console.log("スレッドが追加されました:", docRef.id);

      // スレッドが作成されたら、サブコレクション「messages」を作成
      // メッセージの例をサブコレクションに追加
      const messagesRef = collection(db, "threads", docRef.id, "messages");
      await addDoc(messagesRef, {
        sender: "User1",
        content: "このスレッドに最初のメッセージです。",
        createdAt: new Date(),
      });

    } catch (error) {
      console.error("スレッド追加エラー:", error);
    }
  };

  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm')); // モバイルサイズの判定

  if (!thread) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: 'auto' }}>
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h4">{thread.title}</Typography>
          <Typography variant="body1" color="text.secondary">
            {thread.description}
          </Typography>
        </CardContent>
      </Card>

      <div>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>メッセージ</Typography>
        <Box sx={{ height: "300px", overflowY: "scroll", marginBottom: "16px" }}>
          {messages.map((message) => (
            <Card key={message.id} sx={{ marginBottom: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.primary">
                  {message.sender}: {message.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {message.createdAt.toDate().toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box display="flex" sx={{ padding: 2, flexDirection: isMobile ? "column" : "row" }}>
          <TextField
            label="メッセージを入力"
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ marginBottom: isMobile ? 2 : 0, marginRight: isMobile ? 0 : 2 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSendMessage} 
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            送信
          </Button>
        </Box>
      </div>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => router.push("/threads")}>
          スレッド一覧へ戻る
        </Button>

        <Button variant="contained" color="primary" onClick={handleCreateThread}>
          新しいスレッドを作成
        </Button>
      </Box>
    </Box>
  );
};

export default ThreadDetail;

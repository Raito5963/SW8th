"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../firebase.config"; 
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { TextField, Button, Card, CardContent, Typography, Box, useMediaQuery } from "@mui/material";
import { Theme } from "@mui/material/styles"; 

interface Thread {
  id: string;
  title: string;
  description: string;
  createdAt: Timestamp; 
}

interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: Timestamp; 
}

const ThreadDetail = () => {
  const router = useRouter();
  const { threadId } = useParams<{ threadId: string }>(); // 型を指定
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [error, setError] = useState<string>(""); // errorの型をstringに変更
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみ`useMediaQuery`を実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isMobile = isClient && useMediaQuery((theme: Theme) => theme.breakpoints.down('sm')); // クライアントサイドでのみ実行

  useEffect(() => {
    if (threadId) {
      const fetchThread = async () => {
        const docRef = doc(db, "threads", threadId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setThread({
            id: docSnap.id,
            ...docSnap.data(),
          } as Thread);
        } else {
          setError("スレッドが見つかりません");
        }
      };

      const fetchMessages = () => {
        const messagesRef = collection(db, "threads", threadId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        onSnapshot(q, (querySnapshot) => {
          const messagesData: Message[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            sender: doc.data().sender,
            content: doc.data().content,
            createdAt: doc.data().createdAt as Timestamp,
          }));
          setMessages(messagesData);
        });
      };

      fetchThread();
      fetchMessages();
    }
  }, [threadId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && threadId) {
      try {
        const messageRef = collection(db, "threads", threadId, "messages");
        await addDoc(messageRef, {
          sender: "User",
          content: newMessage,
          createdAt: Timestamp.now(),
        });
        setNewMessage("");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("メッセージ送信エラー: " + err.message); // errorの型をErrorにして適切に処理
        } else {
          setError("メッセージ送信中にエラーが発生しました");
        }
      }
    }
  };

  const handleCreateThread = async () => {
    const newThread = {
      title: "新しいスレッド",
      description: "これは新しいスレッドの説明です。",
      createdAt: Timestamp.now(),
      creator: "User1",
    };

    try {
      const docRef = await addDoc(collection(db, "threads"), newThread);
      console.log("スレッドが追加されました:", docRef.id);
      const messagesRef = collection(db, "threads", docRef.id, "messages");
      await addDoc(messagesRef, {
        sender: "User1",
        content: "このスレッドに最初のメッセージです。",
        createdAt: Timestamp.now(),
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("スレッド作成エラー: " + err.message); // errorの型をErrorにして適切に処理
      } else {
        setError("スレッド作成中にエラーが発生しました");
      }
    }
  };

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
        {error && <Typography color="error">{error}</Typography>}
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

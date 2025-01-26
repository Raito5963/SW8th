"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, storage } from "../../../firebase.config";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TextField, Button, Card, CardContent, Typography, Box } from "@mui/material";

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
  imageUrl?: string;
  createdAt: Timestamp;
}

const ThreadDetail = () => {
  const router = useRouter();
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (threadId) {
      const fetchThread = async () => {
        const docRef = doc(db, "threads", threadId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const threadData = {
            id: docSnap.id,
            ...docSnap.data(),
          } as Thread;
          setThread(threadData);

          const visitedThreads = JSON.parse(localStorage.getItem("visitedThreads") || "[]");
          const updatedThreads = [
            { id: threadData.id, title: threadData.title, description: threadData.description },
            ...visitedThreads.filter((t: Thread) => t.id !== threadData.id),
          ].slice(0, 3);
          localStorage.setItem("visitedThreads", JSON.stringify(updatedThreads));
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
            imageUrl: doc.data().imageUrl,
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
    if (newMessage.trim() || selectedImage) {
      try {
        let imageUrl: string | undefined = undefined;

        if (selectedImage) {
          const imageRef = ref(storage, `thread-images/${selectedImage.name}`);
          await uploadBytes(imageRef, selectedImage);
          imageUrl = await getDownloadURL(imageRef);
        }

        const messageRef = collection(db, "threads", threadId!, "messages");
        await addDoc(messageRef, {
          sender: "User",
          content: newMessage,
          imageUrl,
          createdAt: Timestamp.now(),
        });

        setNewMessage("");
        setSelectedImage(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("メッセージ送信エラー: " + err.message);
        } else {
          setError("メッセージ送信中にエラーが発生しました");
        }
      }
    }
  };

  if (!thread) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: "auto" }}>
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
                {message.imageUrl && <img src={message.imageUrl} alt="添付画像" style={{ maxWidth: "100%" }} />}
                <Typography variant="caption" color="text.secondary">
                  {message.createdAt.toDate().toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ padding: 2, display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            label="メッセージを入力"
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ marginBottom: { xs: 2, sm: 0 }, marginRight: { sm: 2, xs: 0 } }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
            style={{ marginBottom: 8 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            送信
          </Button>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
      </div>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => router.push("/threads")}>
          スレッド一覧へ戻る
        </Button>
      </Box>
    </Box>
  );
};

export default ThreadDetail;

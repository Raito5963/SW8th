"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../firebase.config";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { TextField, Button, Card, CardContent, Typography, Box } from "@mui/material";
import { EditorState, RichUtils } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"; // スタイルをインポート

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
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<EditorState>(EditorState.createEmpty());
  const [error, setError] = useState<string>("");

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
    if (newMessage.getCurrentContent().hasText() && threadId) {
      try {
        const messageRef = collection(db, "threads", threadId, "messages");
        await addDoc(messageRef, {
          sender: "User",
          content: newMessage.getCurrentContent().getPlainText(),
          createdAt: Timestamp.now(),
        });
        setNewMessage(EditorState.createEmpty());
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("メッセージ送信エラー: " + err.message);
        } else {
          setError("メッセージ送信中にエラーが発生しました");
        }
      }
    }
  };

  const handleEditorChange = (editorState: EditorState) => {
    setNewMessage(editorState);
  };

  const handleStyleToggle = (style: string) => {
    const newState = RichUtils.toggleInlineStyle(newMessage, style);
    setNewMessage(newState);
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
                <Typography variant="caption" color="text.secondary">
                  {message.createdAt.toDate().toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ padding: 2, display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
          <Box sx={{ marginBottom: 2 }}>
            <Button onClick={() => handleStyleToggle("BOLD")} variant="contained">
              太字
            </Button>
            <Button onClick={() => handleStyleToggle("ITALIC")} variant="contained" sx={{ marginLeft: 1 }}>
              斜体
            </Button>
          </Box>

          <Editor
            editorState={newMessage}
            onEditorStateChange={handleEditorChange}
            toolbarClassName="editor-toolbar"
            wrapperClassName="editor-wrapper"
            editorClassName="editor-content"
            placeholder="メッセージを入力してください..."
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
        >
          送信
        </Button>

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

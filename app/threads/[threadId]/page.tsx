"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, storage, auth } from "../../../firebase.config";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { TextField, Button, Card, CardContent, Typography, Box, Input, CircularProgress, Avatar } from "@mui/material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image";

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
  imageUrl: string;
  senderPhotoURL: string;
  createdAt: Timestamp;
}

const ThreadDetail = () => {
  const router = useRouter();
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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
            imageUrl: doc.data().imageUrl || "",
            senderPhotoURL: doc.data().senderPhotoURL || "",
            createdAt: doc.data().createdAt as Timestamp,
          }));
          setMessages(messagesData);
        });
      };

      fetchThread();
      fetchMessages();
    }
  }, [threadId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() || selectedImage) {
      setLoading(true);
      try {
        // メッセージ内のリンクの後にスペースを追加する処理
        const formattedMessage = newMessage.replace(/(https?:\/\/[^\s]+)/g, "$1 ");

        let imageUrl = "";
        if (selectedImage) {
          const storageRef = ref(storage, `messages/${threadId}/${Date.now()}_${selectedImage.name}`);
          const snapshot = await uploadBytes(storageRef, selectedImage);
          imageUrl = await getDownloadURL(snapshot.ref); // 画像のURLを取得
        }

        const messageRef = collection(db, "threads", threadId, "messages");
        await addDoc(messageRef, {
          sender: user?.displayName || "User", // ユーザー名を設定
          content: formattedMessage, // フォーマット済みのメッセージを送信
          imageUrl, // 画像のURLをここに追加
          senderPhotoURL: user?.photoURL || "", // ユーザーのアイコンURLを追加
          createdAt: Timestamp.now(),
        });

        // メッセージ送信後のリセット
        setNewMessage("");
        setSelectedImage(null);
        setImagePreview(null);
      } catch (err: unknown) {
        setError("メッセージ送信エラー: " + (err instanceof Error ? err.message : "不明なエラー"));
      } finally {
        setLoading(false);
      }
    } else {
      setError("メッセージまたは画像を入力してください");
    }
  };

  const handleUserProfileClick = () => {
    if (user) {
      router.push(`/${user.uid}`);
    }
  };

  // URLをリンクに変換する関数
  const extractUrls = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.split(urlPattern).map((part, index) => {
      if (urlPattern.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
            {part}
          </a>
        );
      } else {
        return part;
      }
    });
  };

  if (!thread) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: "auto" }}>
      <Card sx={{ marginBottom: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {thread.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {thread.description}
          </Typography>
        </CardContent>
      </Card>

      <div>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>メッセージ</Typography>
        <Box sx={{ height: "300px", overflowY: "scroll", marginBottom: "20px" }}>
          {messages.length > 0 ? (
            messages.map((message) => (
              <Card key={message.id} sx={{ marginBottom: 2, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      alt={message.sender}
                      src={message.senderPhotoURL || ""} // ユーザーのアイコンURLを表示
                      onClick={handleUserProfileClick}
                      sx={{ cursor: "pointer" }}
                    />
                    <Typography variant="body2" color="text.primary" onClick={handleUserProfileClick} sx={{ cursor: "pointer" }}>
                      {message.sender}
                    </Typography>
                  </Box>
                  {message.content && (
                    <Typography variant="body1" sx={{ marginTop: 1 }}>
                      {extractUrls(message.content)}  {/* URLをリンクに変換 */}
                    </Typography>
                  )}
                  {message.imageUrl && (
                    <Box sx={{ marginBottom: 2, display: "flex", justifyContent: "center" }}>
                      <Image src={message.imageUrl} alt="message image" style={{ width: "100%",height:"auto", borderRadius: "8px" }} />
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ marginTop: 1 }}>
                    {message.createdAt.toDate().toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>メッセージはありません</Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="メッセージを入力"
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ marginBottom: 2 }}
            multiline
            rows={4}
          />
          <Input
            type="file"
            inputProps={{ accept: "image/*" }}
            onChange={handleImageChange}
            sx={{ marginBottom: 2 }}
          />
          {imagePreview && (
            <Box sx={{ marginBottom: 2, display: "flex", justifyContent: "center" }}>
              <Image src={imagePreview} alt="preview" style={{ width: "100%",height:"auto", borderRadius: "8px" }} />
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              sx={{
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "bold",
                width: "48%",
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "送信"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/threads")}
              sx={{
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "bold",
                width: "48%",
              }}
            >
              キャンセル
            </Button>
          </Box>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
      </div>
    </Box>
  );
};

export default ThreadDetail;

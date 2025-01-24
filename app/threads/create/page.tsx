"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../firebase.config"; // Firebase設定ファイルのインポート
import { collection, addDoc } from "firebase/firestore";
import { TextField, Button, Box, useMediaQuery, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles"; // Theme型をインポート

const CreateThread = () => {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateThread = async (): Promise<void> => {
    if (!title || !description) return;

    setLoading(true);
    try {
      // 新しいスレッド情報をFirestoreに追加
      await addDoc(collection(db, "threads"), {
        title: title,
        description: description,
        createdAt: new Date(), // 作成日時を追加
      });
      setTitle("");
      setDescription("");
      alert("スレッドが作成されました");
      router.push("/threads"); // スレッド一覧ページへリダイレクト
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("スレッド作成に失敗しました");
    }
    setLoading(false);
  };

  // useMediaQueryを使って、モバイルサイズを判定
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm')); // Theme型を指定

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        maxWidth: 600,
        margin: 'auto',
        gap: 2,
      }}
    >
      <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
        スレッド作成
      </Typography>
      <TextField
        label="タイトル"
        variant="outlined"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
      />
      <TextField
        label="説明"
        variant="outlined"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
      />
      <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', width: '100%' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateThread}
          disabled={loading}
          fullWidth={!isMobile}
        >
          スレッドを作成
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.push("/threads")}
          fullWidth={!isMobile}
        >
          スレッド一覧へ
        </Button>
      </Box>
    </Box>
  );
};

export default CreateThread;

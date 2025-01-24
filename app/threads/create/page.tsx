"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../firebase.config"; // Firebase設定ファイルのインポート
import { collection, addDoc } from "firebase/firestore";
import { TextField, Button } from "@mui/material";

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

  return (
    <div>
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateThread}
        disabled={loading}
      >
        スレッドを作成
      </Button>
      <Button variant="contained" color="primary" onClick={() => router.push("/threads")}>
        スレッド一覧へ
      </Button>
    </div>
  );
};

export default CreateThread;

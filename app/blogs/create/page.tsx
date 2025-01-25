"use client";

import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  ContentState,
  AtomicBlockUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { Button, Box, Typography, TextField, Container } from "@mui/material";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebaseの設定情報（例）
const firebaseConfig = {
  apiKey: "AIzaSyC7yM9_KwnW_kFbf_zJhLO4zjetqE8J9jY",
  authDomain: "sw-shizuoka-8.firebaseapp.com",
  projectId: "sw-shizuoka-8",
  storageBucket: "sw-shizuoka-8.firebasestorage.app",
  messagingSenderId: "554020673678",
  appId: "1:554020673678:web:5a73a450e1bc0802bc11df",
  measurementId: "G-33XNG3JMWC"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// FirestoreとStorageを取得
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
// 画像アップロード用の関数（Firebase Storageを使用）
const uploadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `images/${file.name}`);
  await uploadBytes(storageRef, file); // Firebase Storageに画像をアップロード
  const imageUrl = await getDownloadURL(storageRef); // アップロードした画像のURLを取得
  return imageUrl;
};

const BlogEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // クライアントサイドでのみEditorStateを初期化
  useEffect(() => {
    const initialState = EditorState.createWithContent(ContentState.createFromText(""));
    setEditorState(initialState);
  }, []);

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
  };

  const handleStyleToggle = (style: string) => {
    if (editorState) {
      setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    }
  };

  const handleAddImage = (imageUrl: string) => {
    if (editorState) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        "IMAGE",
        "IMMUTABLE",
        { src: imageUrl }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        " "
      );
      setEditorState(newEditorState);
    }
  };

  // 画像ファイルが選択されたときの処理
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = await uploadImage(file); // FirebaseにアップロードしURLを取得
      handleAddImage(imageUrl); // エディタに画像を追加
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください！");
      return;
    }

    setLoading(true);
    try {
      if (editorState) {
        const content = editorState.getCurrentContent();
        const rawContent = JSON.stringify(convertToRaw(content));

        await addDoc(collection(db, "blogs"), {
          title,
          content: rawContent,
          createdAt: new Date(),
        });

        alert("記事が保存されました！");
        setTitle("");
        setEditorState(EditorState.createWithContent(ContentState.createFromText("")));
      }
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
      alert("保存中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  if (!editorState) {
    return null;
  }

  return (
    <Container>
      <Box sx={{ p: 4, maxWidth: "800px", margin: "0 auto" }}>
        <Typography variant="h4" gutterBottom>
          ブログ記事を作成
        </Typography>
        <TextField
          fullWidth
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => handleStyleToggle("BOLD")}
            sx={{ mr: 1 }}
          >
            太字
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleStyleToggle("ITALIC")}
            sx={{ mr: 1 }}
          >
            斜体
          </Button>
          <Button variant="outlined" onClick={() => handleStyleToggle("UNDERLINE")}>
            下線
          </Button>
          <Button variant="outlined" component="label" sx={{ mr: 1 }}>
            画像を追加
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload} // ファイル選択時に呼ばれる
            />
          </Button>
        </Box>
        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            minHeight: "300px",
            padding: "16px",
            cursor: "text",
          }}
          onClick={() => {
            const editor = document.querySelector(".public-DraftEditor-content");
            (editor as HTMLElement)?.focus();
          }}
        >
          <Editor
            editorState={editorState}
            onChange={handleEditorChange}
            placeholder="ここにブログ記事を書いてください..."
          />
        </Box>
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "保存中..." : "保存"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BlogEditor;

"use client";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Editor } from 'react-draft-wysiwyg';

import React, { useState, useEffect } from "react";
import {
  EditorState,
  RichUtils,
  convertToRaw,
  ContentState,
  AtomicBlockUtils,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { Button, Box, Typography, TextField, Container } from "@mui/material";
import { db } from "../../../firebase.config";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import draftToHtml from "draftjs-to-html";  // draftjs-to-html をインポート

const BlogEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // error state defined here
  interface Blog {
    title: string;
    content: string;
    createdAt: Date;
    contentHTML?: string;
  }

  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (error) {
      alert(error);
      setError(null);
    }
  }, [error]);

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

  // 記事保存時にFirestoreに保存し、リダイレクトする
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

        // Firestoreにデータを保存し、IDを取得
        const docRef = await addDoc(collection(db, "blogs"), {
          title,
          content: rawContent,
          createdAt: new Date(),
        });

        // 保存した記事のIDを取得
        const blogId = docRef.id;

        alert("記事が保存されました！");
        setTitle("");
        setEditorState(EditorState.createWithContent(ContentState.createFromText("")));
        
        // 保存後に記事ページにリダイレクト
        window.location.href = `/blog/${blogId}`;
      }
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
      alert("保存中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  // [blogId]で記事を表示
  const blogId = window.location.pathname.split("/").pop();

  useEffect(() => {
    const fetchBlog = async () => {
      if (blogId) {
        try {
          // blogIdを使ってFirestoreからデータを取得
          const blogDocRef = doc(db, "blogs", blogId);
          const blogDoc = await getDoc(blogDocRef);

          if (blogDoc.exists()) {
            const blogData = blogDoc.data();
            // ContentStateに変換してHTMLに変換
            const contentState = convertFromRaw(JSON.parse(blogData.content));
            const contentHTML = draftToHtml(convertToRaw(contentState));
            setBlog({ 
              title: blogData.title, 
              content: blogData.content, 
              createdAt: blogData.createdAt.toDate(), 
              contentHTML 
            });
          } else {
            setError("記事が見つかりませんでした。");
          }
        } catch (error) {
          setError("記事の取得に失敗しました。");
        }
      }
    };

    fetchBlog();
  }, [blogId]);

  if (!editorState && !blog) {
    return null;
  }

  return (
    <Container>
      <Box sx={{ p: 4, maxWidth: "800px", margin: "0 auto" }}>
        {!blog ? (
          <>
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
              <Button
                variant="outlined"
                onClick={() => handleAddImage("https://example.com/your-image.jpg")}
                sx={{ mr: 1 }}
              >
                画像を追加
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
              {editorState && (
                <Editor
                  editorState={editorState}
                  onEditorStateChange={handleEditorChange}
                  placeholder="ここにブログ記事を書いてください..."
                />
              )}
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
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              {blog?.title}
            </Typography>
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                minHeight: "300px",
                padding: "16px",
              }}
              dangerouslySetInnerHTML={{ __html: blog?.contentHTML || "" }}  // HTMLとして表示
            />
          </>
        )}
      </Box>
    </Container>
  );
};

export default BlogEditor;

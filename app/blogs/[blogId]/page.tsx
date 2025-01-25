"use client";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';


import React, { useState, useEffect } from "react";
import {
  EditorState,
  convertToRaw,
  ContentState,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import {  Box, Typography, Container } from "@mui/material";
import { db } from "../../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import draftToHtml from "draftjs-to-html";  // draftjs-to-html をインポート

const BlogEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
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
        } catch {
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
        {error && (
          <Typography color="error" variant="h6" gutterBottom>
            {error}  {/* Show error message */}
          </Typography>
        )}
        {!blog ? (
          <>
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

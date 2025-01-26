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
import { Box, Typography, Container, Link } from "@mui/material";
import { db } from "../../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import draftToHtml from "draftjs-to-html";

const BlogEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  interface Blog {
    title: string;
    content: string;
    createdAt: Date;
    contentHTML?: string;
  }

  const [blog, setBlog] = useState<Blog | null>(null);

  // クライアントサイドでのみ EditorState を初期化
  useEffect(() => {
    const initialState = EditorState.createWithContent(
      ContentState.createFromText("")
    );
    setEditorState(initialState);
  }, []);

  // [blogId] で記事を表示
  const blogId = window.location.pathname.split("/").pop();

  useEffect(() => {
    const fetchBlog = async () => {
      if (blogId) {
        const blogDocRef = doc(db, "blogs", blogId);
        const blogDoc = await getDoc(blogDocRef);

        if (blogDoc.exists()) {
          const blogData = blogDoc.data();
          const contentState = convertFromRaw(JSON.parse(blogData.content));
          const contentHTML = draftToHtml(convertToRaw(contentState));
          setBlog({
            title: blogData.title,
            content: blogData.content,
            createdAt: blogData.createdAt.toDate(),
            contentHTML,
          });
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
        {blog && (
          <>
            <Typography variant="h4" gutterBottom>
              {blog.title}
            </Typography>
            <Link href="/blogs">
              ブログ一覧へ
            </Link>
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                minHeight: "300px",
                padding: "16px",
              }}
              dangerouslySetInnerHTML={{ __html: blog.contentHTML || "" }}
            />
          </>
        )}
      </Box>
    </Container>
  );
};

export default BlogEditor;

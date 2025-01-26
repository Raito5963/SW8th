"use client";
import React, { useState, useEffect } from "react";
import {
  convertToRaw,
  ContentState,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { Box, Typography, Container, Link } from "@mui/material";
import { db } from "../../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import draftToHtml from "draftjs-to-html";

const BlogDisplay: React.FC = () => {
  const [blog, setBlog] = useState<{
    title: string;
    contentHTML: string;
    createdAt: Date;
  } | null>(null);

  // URLから blogId を取得
  const blogId = window.location.pathname.split("/").pop();

  // Firestoreからブログデータを取得
  useEffect(() => {
    const fetchBlog = async () => {
      if (blogId) {
        try {
          const blogDocRef = doc(db, "blogs", blogId);
          const blogDoc = await getDoc(blogDocRef);

          if (blogDoc.exists()) {
            const blogData = blogDoc.data();

            // Firestoreから取得した JSON データを ContentState に変換
            const rawContent = JSON.parse(blogData.content);
            const contentState = convertFromRaw(rawContent);

            // draftToHtml を使用して HTML に変換
            const contentHTML = draftToHtml(convertToRaw(contentState));

            setBlog({
              title: blogData.title || "タイトルなし",
              contentHTML,
              createdAt: blogData.createdAt.toDate(),
            });
          } else {
            console.error("ブログが存在しません");
          }
        } catch (error) {
          console.error("データの取得に失敗しました:", error);
        }
      }
    };

    fetchBlog();
  }, [blogId]);

  if (!blog) {
    return <Typography variant="h6">読み込み中...</Typography>;
  }

  return (
    <Container>
      <Box sx={{ p: 4, maxWidth: "800px", margin: "0 auto" }}>
        <Typography variant="h4" gutterBottom>
          {blog.title}
        </Typography>
        <Typography variant="body2" gutterBottom color="text.secondary">
          投稿日時: {blog.createdAt.toLocaleString()}
        </Typography>
        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            minHeight: "300px",
            padding: "16px",
            marginTop: 2,
          }}
          dangerouslySetInnerHTML={{ __html: blog.contentHTML }}
        />
        <Link href="/blogs" sx={{ display: "block", marginTop: 2 }}>
          ブログ一覧へ戻る
        </Link>
      </Box>
    </Container>
  );
};

export default BlogDisplay;

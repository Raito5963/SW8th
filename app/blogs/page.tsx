"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.config"; // Firebase設定をインポート
import { Box, Typography, Paper, CircularProgress,Link } from "@mui/material";

interface Blog {
  id: string;
  title: string;
  createdAt: string;
}

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedBlogs: Blog[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          createdAt: doc.data().createdAt.toDate().toLocaleString(), // 日時フォーマット
        }));
        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error("ブログ取得中にエラーが発生しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        ブログ一覧
      </Typography>
      <Link href="/blogs/create">
        新規ブログ作成
      </Link>
      <Link href="/">
        トップページへ
      </Link>
      {blogs.length === 0 ? (
        <Typography>現在、ブログはありません。</Typography>
      ) : (
        blogs.map((blog) => (
          <Paper
            key={blog.id}
            elevation={3}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Link href={`/blogs/${blog.id}`}>
              <Typography
                variant="h6"
                sx={{
                  cursor: "pointer",
                  color: "primary.main",
                  textDecoration: "underline",
                }}
              >
                {blog.title}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary">
              作成日時: {blog.createdAt}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default BlogList;

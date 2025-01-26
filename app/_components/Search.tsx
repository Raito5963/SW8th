"use client";

import { useState, useEffect, JSX } from "react";
import { db } from "../../firebase.config"; // Firebase設定ファイルのインポート
import { collection, getDocs, Timestamp, query, orderBy } from "firebase/firestore";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Link,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface Thread {
  id: string;
  title: string;
  description: string;
  createdAt: Timestamp; // FirestoreのTimestamp型に変更
}

interface Blog {
  id: string;
  title: string;
  createdAt: string;
}

const ThreadList: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false); // 検索中かどうかを管理
  const router = useRouter();

  // スレッドデータを取得
  useEffect(() => {
    const fetchThreads = async () => {
      const querySnapshot = await getDocs(collection(db, "threads"));
      const threadsData: Thread[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Thread[];
      setThreads(threadsData);
    };

    fetchThreads();
  }, []);

  // ブログデータを取得
  useEffect(() => {
    const fetchBlogs = async () => {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedBlogs: Blog[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        createdAt: doc.data().createdAt.toDate().toLocaleString(), // 日時フォーマット
      }));
      setBlogs(fetchedBlogs);
    };

    fetchBlogs();
  }, []);

  // 検索クエリに基づいてスレッドとブログをフィルタリング
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredThreads([]); // 検索クエリが空ならフィルタリング結果をクリア
      setFilteredBlogs([]);    // 同様にブログもクリア
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();

      // スレッドのフィルタリング
      const filteredThreads = threads.filter((thread) => {
        return (
          thread.title.toLowerCase().includes(lowerCaseQuery) ||
          thread.description.toLowerCase().includes(lowerCaseQuery) ||
          thread.createdAt.toDate().toLocaleDateString().includes(lowerCaseQuery)
        );
      });

      // ブログのフィルタリング
      const filteredBlogs = blogs.filter((blog) => {
        return blog.title.toLowerCase().includes(lowerCaseQuery) || blog.createdAt.includes(lowerCaseQuery);
      });

      setFilteredThreads(filteredThreads);
      setFilteredBlogs(filteredBlogs);
    }
  }, [searchQuery, threads, blogs]);

  // 一致部分をハイライトする関数
  const highlightText = (text: string, query: string): JSX.Element => {
    if (!query) return <>{text}</>; // クエリが空ならそのまま返す

    const regex = new RegExp(`(${query})`, "gi"); // 大文字・小文字を区別しない正規表現
    const parts = text.split(regex); // 一致部分で文字列を分割

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ backgroundColor: "yellow" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
      {/* 検索バー */}
      <TextField
        fullWidth
        label="検索"
        variant="outlined"
        value={searchQuery}
        onFocus={() => setIsSearching(true)} // フォーカス時に検索モードに切り替え
        onBlur={() => !searchQuery && setIsSearching(false)} // 入力が空の場合、フォーカスを外すと検索モードを終了
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          maxWidth: 600,
          mb: 3,
        }}
      />

      {/* 検索結果 - スレッド */}
      {isSearching && filteredThreads.length > 0 && (
        filteredThreads.map((thread) => (
          <Card
            key={thread.id}
            sx={{
              width: "100%",
              maxWidth: 600,
              margin: 2,
              "@media (max-width: 600px)": {
                margin: 1,
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                {highlightText(thread.title, searchQuery)}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  marginBottom: 2,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {highlightText(thread.description, searchQuery)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ marginBottom: 1 }}
              >
                投稿日:{" "}
                {highlightText(
                  thread.createdAt.toDate().toLocaleDateString(),
                  searchQuery
                )}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push(`/threads/${thread.id}`)}
                sx={{
                  width: "100%",
                  "@media (min-width: 600px)": {
                    width: "auto",
                  },
                }}
              >
                詳細を見る
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {/* 検索結果 - ブログ */}
      {isSearching && filteredBlogs.length > 0 && (
        filteredBlogs.map((blog) => (
          <Card
            key={blog.id}
            elevation={3}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              maxWidth: 600,
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
                {highlightText(blog.title, searchQuery)}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary">
              作成日時: {highlightText(blog.createdAt, searchQuery)}
            </Typography>
          </Card>
        ))
      )}

      {/* 検索結果が見つからない場合の表示 */}
      {isSearching && searchQuery.trim() && filteredThreads.length === 0 && filteredBlogs.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          該当するスレッドやブログが見つかりませんでした。
        </Typography>
      )}
    </Box>
  );
};

export default ThreadList;

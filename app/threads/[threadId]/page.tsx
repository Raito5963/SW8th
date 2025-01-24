"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../firebase.config";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { TextField, Button, Card, CardContent, Typography, Box, useMediaQuery, useTheme } from "@mui/material";

const ThreadDetail = () => {
  const router = useRouter();
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // クライアントサイドでのみ`useMediaQuery`を評価
  useEffect(() => {
    setIsMobile(useMediaQuery(theme.breakpoints.down('sm')));
  }, [theme]);

  // 他のコード（fetchThreadやfetchMessagesなど）はそのまま

  return (
    <Box>
      {/* その他のレンダリングコード */}
      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
        {/* メッセージ送信ボタンなど */}
      </Box>
    </Box>
  );
};

export default ThreadDetail;

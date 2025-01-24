"use client";
import { useEffect, useState } from "react";
import React from "react";

type Post = {
  id: string;
  title: string;
  content: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // 型を明示

  useEffect(() => {
    fetch("/api/getPosts")
      .then((res) => res.json())
      .then((data: Post[]) => setPosts(data)) // データ型を指定
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  return (
    <div>
      <h1>コミュニティ投稿</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

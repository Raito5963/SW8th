import { db } from "../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

type PostData = {
  title: string;
  content: string;
  createdAt: Date;
};

type ResponseData = {
  message?: string;
  id?: string;
  error?: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const { title, content } = req.body;

    // リクエストボディの検証
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    try {
      // Firestoreにデータを追加
      const docRef = await addDoc(collection(db, "posts"), {
        title,
        content,
        createdAt: new Date(),
      } as PostData);

      res.status(200).json({ message: "Post added successfully!", id: docRef.id });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({
          error: "Failed to add post",
          details: error.message,
        });
      } else {
        res.status(500).json({
          error: "Failed to add post",
          details: "An unknown error occurred",
        });
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

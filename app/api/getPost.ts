import { db } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
};

type ResponseData = Post[] | { error: string; details?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // Firestoreからデータを取得
    const querySnapshot = await getDocs(collection(db, "posts"));
    const posts: Post[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt.toDate(), // FirestoreのTimestampをDate型に変換
      };
    });

    res.status(200).json(posts);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        error: "Failed to fetch posts",
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: "Failed to fetch posts",
        details: "An unknown error occurred",
      });
    }
  }
}

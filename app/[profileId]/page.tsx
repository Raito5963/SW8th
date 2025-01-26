// profile/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase.config"; // Firebase 初期化コード
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button, TextField, CircularProgress, Avatar } from "@mui/material";

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState({
    introduction: "",
    hobbies: "",
    age: "",
    job: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // ユーザーのプロフィールデータをFirestoreから取得
      const fetchProfile = async () => {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as typeof profile);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, "profiles", user.uid);
      await setDoc(docRef, profile, { merge: true });
      alert("プロフィールが保存されました！");
    } catch (err) {
      console.error(err);
      alert("プロフィールの保存中にエラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <p>ログインしてください。</p>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Avatar
          src={user.photoURL || undefined}
          alt={user.displayName || "ゲスト"}
          sx={{
            width: 40,
            height: 40,
            marginRight: 1,
            cursor: "pointer",
            borderRadius: "50%",
          }}
        />
        <h1 className="text-xl font-bold inline">{user.displayName}</h1>
        <div>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <TextField
          label="自己紹介"
          name="introduction"
          value={profile.introduction}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={4}
        />
        <TextField
          label="趣味"
          name="hobbies"
          value={profile.hobbies}
          onChange={handleInputChange}
          fullWidth
        />
        <TextField
          label="年齢"
          name="age"
          value={profile.age}
          onChange={handleInputChange}
          fullWidth
        />
        <TextField
          label="職業"
          name="job"
          value={profile.job}
          onChange={handleInputChange}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? "保存中..." : "保存する"}
        </Button>
      </div>
    </div>
  );
}

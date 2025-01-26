"use client";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase.config"; // Firebase 初期化コード
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button, TextField, CircularProgress, Avatar, Typography, Box } from "@mui/material";

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
    <Box className="p-6 max-w-2xl mx-auto">
      <Box display="flex" alignItems="center" mb={4}>
        <Avatar
          src={user.photoURL || undefined}
          alt={user.displayName || "ゲスト"}
          sx={{
            width: 56,
            height: 56,
            marginRight: 2,
            cursor: "pointer",
            objectFit: "cover",
          }}
        />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {user.displayName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.email}
          </Typography>
        </Box>
      </Box>

      <Box mt={4}>
        <TextField
          label="自己紹介"
          name="introduction"
          value={profile.introduction}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="趣味"
          name="hobbies"
          value={profile.hobbies}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="年齢"
          name="age"
          value={profile.age}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="職業"
          name="job"
          value={profile.job}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveProfile}
          disabled={saving}
          sx={{
            marginTop: 2,
            width: "100%",
            padding: "12px",
            fontSize: "16px",
          }}
        >
          {saving ? "保存中..." : "保存する"}
        </Button>
      </Box>
    </Box>
  );
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // これを追加
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC7yM9_KwnW_kFbf_zJhLO4zjetqE8J9jY",
    authDomain: "sw-shizuoka-8.firebaseapp.com",
    projectId: "sw-shizuoka-8",
    storageBucket: "sw-shizuoka-8.firebasestorage.app",
    messagingSenderId: "554020673678",
    appId: "1:554020673678:web:5a73a450e1bc0802bc11df",
    measurementId: "G-33XNG3JMWC"
  };

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firestoreインスタンスを作成
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // これを追加

export { storage }; 
export { auth };
export { db };
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcI_Ht_b74hlBne5C65cf6uZhj1UQKdF0",
  authDomain: "seniordemos-5ee09.firebaseapp.com",
  projectId: "seniordemos-5ee09",
  storageBucket: "seniordemos-5ee09.appspot.com",
  messagingSenderId: "2590562387",
  appId: "1:2590562387:web:2ee76e4a3036995fa44ea6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyB6wYu3pE29QmPwqXhlk7W0nR1MyQzWwFg",
  authDomain: "family-expense-tracker-29d3f.firebaseapp.com",
  projectId: "family-expense-tracker-29d3f",
  storageBucket: "family-expense-tracker-29d3f.firebasestorage.app",
  messagingSenderId: "205128487789",
  appId: "1:205128487789:web:adc8f18b967f30b6384064",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
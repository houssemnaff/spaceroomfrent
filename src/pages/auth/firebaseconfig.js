import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDuMH8QGOZoFek_621paZNVrZjv40LgUmY",
  authDomain: "spaceroom-8caed.firebaseapp.com",
  projectId: "spaceroom-8caed",
  storageBucket: "spaceroom-8caed.appspot.com",
  messagingSenderId: "359286074679",
  appId: "1:359286074679:web:77d457f89a268ad0dbbeb2",
  measurementId: "G-W4J0YX9P1N"
};


// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
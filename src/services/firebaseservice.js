import { storage } from "@/pages/auth/firebaseconfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const uploadFileToFirebase = async (file) => {
  return new Promise((resolve, reject) => {
    const fileRef = ref(storage, `resources/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(`Upload en cours: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

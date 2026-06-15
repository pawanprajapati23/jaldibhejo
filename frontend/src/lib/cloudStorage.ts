import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { ref as dbRef, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";

export async function uploadToCloud(
  files: File[],
  onProgress: (progress: number) => void
): Promise<{ link?: string; error?: string }> {
  if (files.length === 0) return { error: "No files to upload." };

  let fileToUpload: Blob | File;
  let fileName = "";
  let isZip = false;

  if (files.length === 1) {
    fileToUpload = files[0];
    fileName = files[0].name;
  } else {
    isZip = true;
    fileName = "JaldiBhejo_Files.zip";
    const zip = new JSZip();
    files.forEach((f) => zip.file(f.name, f));
    fileToUpload = await zip.generateAsync({ type: "blob" });
  }

  // Double check size limit (50MB)
  if (fileToUpload.size > 50 * 1024 * 1024) {
    return { error: "File exceeds 50MB cloud limit." };
  }

  const id = uuidv4().substring(0, 8); // Short ID
  const storageRef = ref(storage, `cloud-links/${id}/${fileName}`);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress));
      },
      (error) => {
        resolve({ error: error.message });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await set(dbRef(db, `cloud-links/${id}`), {
          url: downloadURL,
          name: fileName,
          size: fileToUpload.size,
          expiresAt,
          isZip,
        });

        resolve({ link: `${window.location.origin}/d/${id}` });
      }
    );
  });
}

"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTransferStore } from "@/store/useTransferStore";
import { webrtcEngine } from "@/lib/WebRTCEngine";

export function ServiceWorkerRegister() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setFiles, setTextPayload, setMode, setRole } = useTransferStore();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log("Service Worker registration successful with scope: ", registration.scope);
          },
          function (err) {
            console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);

  useEffect(() => {
    const isShared = searchParams.get("shared");
    if (isShared === "1") {
      // Read from IndexedDB
      const request = indexedDB.open("JaldiBhejoShareDB", 1);
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        
        // Ensure object stores exist before querying to avoid errors
        if (!db.objectStoreNames.contains('sharedFiles') || !db.objectStoreNames.contains('sharedText')) {
            return;
        }
        
        const tx = db.transaction(["sharedFiles", "sharedText"], "readwrite");
        const fileStore = tx.objectStore("sharedFiles");
        const textStore = tx.objectStore("sharedText");

        const getFiles = fileStore.getAll();
        const getText = textStore.getAll();

        getFiles.onsuccess = () => {
          const files = getFiles.result;
          getText.onsuccess = () => {
            const texts = getText.result;
            let hasData = false;

            if (files && files.length > 0) {
              setFiles(files);
              hasData = true;
            }

            if (texts && texts.length > 0) {
              const td = texts[0];
              const combinedText = [td.title, td.text, td.url].filter(Boolean).join("\n");
              if (combinedText) {
                setTextPayload(combinedText);
                hasData = true;
              }
            }

            if (hasData) {
              setMode("send");
              setRole("sender");
              webrtcEngine.connect();
              webrtcEngine.createRoom();
            }

            // Clear DB after reading
            fileStore.clear();
            textStore.clear();

            // Remove query param to prevent re-triggering
            router.replace("/");
          };
        };
      };
    }
  }, [searchParams, router, setFiles, setTextPayload, setMode, setRole]);

  return null;
}

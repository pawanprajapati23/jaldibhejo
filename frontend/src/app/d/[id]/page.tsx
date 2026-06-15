"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get, remove } from "firebase/database";
import { Loader2, Download, AlertCircle, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatBytes } from "@/components/tools/ToolShared";

export default function DownloadPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileData, setFileData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchLink = async () => {
      try {
        const snapshot = await get(ref(db, `cloud-links/${id}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (Date.now() > data.expiresAt) {
            // Expired
            await remove(ref(db, `cloud-links/${id}`));
            setError("This link has expired and the file has been deleted.");
          } else {
            setFileData(data);
          }
        } else {
          setError("Link not found or has already expired.");
        }
      } catch (err) {
        setError("Failed to load file information.");
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [id]);

  return (
    <div className="w-full max-w-md mx-auto text-center animate-in fade-in zoom-in duration-300">
      {loading ? (
        <div className="glass-panel p-12 flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <h2 className="text-xl font-bold text-textMain">Looking up file...</h2>
        </div>
      ) : error ? (
        <div className="glass-panel p-12 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 border border-red-500/30">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-textMain mb-2">Link Expired</h2>
          <p className="text-textMuted mb-8">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl font-bold hover:bg-surfaceHover transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>
      ) : fileData && (
        <div className="glass-panel p-8 md:p-12 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-border text-primary flex items-center justify-center mb-6 shadow-md">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-bold text-textMain mb-2 truncate w-full" title={fileData.name}>
            {fileData.name}
          </h2>
          <p className="text-textMuted mb-2">
            Size: <span className="font-mono text-textMain font-medium">{formatBytes(fileData.size)}</span>
          </p>
          <p className="text-sm text-red-400 mb-8 font-medium">
            Expires in {Math.max(1, Math.round((fileData.expiresAt - Date.now()) / 60000))} minutes
          </p>

          <a 
            href={fileData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Download size={20} /> Download File
          </a>
        </div>
      )}
    </div>
  );
}

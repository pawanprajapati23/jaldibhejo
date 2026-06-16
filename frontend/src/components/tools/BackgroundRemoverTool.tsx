"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Wand2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, downloadBlob, formatBytes, basename } from "./ToolShared";

export function BackgroundRemoverTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [output, setOutput] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadingModel, setLoadingModel] = useState(false);
  const [progress, setProgress] = useState(0);

  const modelRef = useRef<any>(null);
  const processorRef = useRef<any>(null);

  // Initialize the AI model
  useEffect(() => {
    const loadModel = async () => {
      setLoadingModel(true);
      try {
        const { env, AutoModel, AutoProcessor } = await import('@xenova/transformers');
        // Configure transformers.js for the browser
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        
        // We use RMBG-1.4 which is highly optimized for background removal
        const model_id = "briaai/RMBG-1.4";
        
        processorRef.current = await AutoProcessor.from_pretrained(model_id, {
          config: {
            do_normalize: true,
            do_pad: false,
            do_rescale: true,
            do_resize: true,
            image_mean: [0.5, 0.5, 0.5],
            feature_extractor_type: "ImageFeatureExtractor",
            image_std: [1, 1, 1],
            resample: 2,
            rescale_factor: 0.00392156862745098,
            size: { width: 1024, height: 1024 }
          }
        });
        
        modelRef.current = await AutoModel.from_pretrained(model_id, {
          quantized: false, // For better quality mask
        });
        
      } catch (err) {
        console.error("Error loading model:", err);
      } finally {
        setLoadingModel(false);
      }
    };
    
    // We load it asynchronously in the background
    loadModel();
  }, []);

  const removeBackground = async () => {
    const file = files[0];
    if (!file) return;

    if (!modelRef.current || !processorRef.current) {
      setError("AI Engine is still loading. Please wait a moment.");
      return;
    }

    setBusy(true);
    setError("");
    setProgress(10); // Starting

    try {
      const { RawImage } = await import('@xenova/transformers');
      // 1. Load image
      const url = URL.createObjectURL(file);
      const img = await RawImage.fromURL(url);
      setProgress(30); // Image loaded
      
      // 2. Preprocess image
      const { pixel_values } = await processorRef.current(img);
      setProgress(50); // Preprocessed

      // 3. Predict mask
      const { output: mask } = await modelRef.current({ input: pixel_values });
      setProgress(80); // Mask predicted

      // 4. Extract mask and apply to original image
      // Convert the mask tensor to an actual image mask
      const maskImage = await RawImage.fromTensor(mask[0].mul(255).to("uint8")).resize(img.width, img.height);
      
      // Create a canvas to apply the mask
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get 2d context");

      // Draw original image
      const originalImageElement = new Image();
      originalImageElement.src = url;
      await new Promise(resolve => { originalImageElement.onload = resolve; });
      ctx.drawImage(originalImageElement, 0, 0);

      // Extract raw image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelData = imageData.data;

      // Apply the mask to the alpha channel
      const maskData = maskImage.data;
      for (let i = 0; i < maskData.length; ++i) {
        // Pixel data is RGBA (4 channels), mask is 1 channel (grayscale)
        // We set the alpha channel of the original image based on the mask value
        pixelData[4 * i + 3] = maskData[i]; 
      }

      ctx.putImageData(imageData, 0, 0);
      setProgress(95); // Mask applied

      // Convert canvas back to Blob
      const resultBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Canvas toBlob failed")), "image/png");
      });

      setOutput(resultBlob);
      setProgress(100);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to remove background. Please try a different image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="AI Background Remover" description="Instantly remove image backgrounds using a state-of-the-art Neural Network (RMBG) running entirely in your browser.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <FileInput accept="image/jpeg,image/png,image/webp" label="Choose Image" files={files} onChange={(nextFiles) => {
             setFiles(nextFiles.slice(0, 1));
             setOutput(null);
             setError("");
          }} />
          
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {output && (
            <div className="rounded-xl border border-border bg-surface p-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
               {/* Checkered pattern background for transparent PNGs */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
               
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={URL.createObjectURL(output)} alt="Transparent Background" className="max-w-full max-h-[300px] object-contain mb-8 relative z-10 drop-shadow-2xl" />
               
               <div className="relative z-10 w-full">
                  <h3 className="text-xl font-bold text-textMain mb-2 flex items-center justify-center gap-2">
                    <Sparkles size={20} className="text-primary" /> Magic Complete
                  </h3>
                  <p className="text-sm text-textMuted mb-6">High-quality transparent PNG generated offline.</p>
                  
                  <SecondaryButton onClick={() => downloadBlob(`${basename(files[0]?.name ?? "image")}-transparent.png`, output)} disabled={!output} className="w-full justify-center bg-primary text-white border-primary hover:bg-primary/90 hover:border-primary">
                    <Download size={18} />
                    Download HD Image
                  </SecondaryButton>
               </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-sm font-bold text-textMain flex items-center gap-2 mb-4">
               <Wand2 size={16} className="text-secondary" /> AI Processor
            </h3>
            <p className="text-xs leading-5 text-textMuted mb-6">
              This tool downloads a lightweight Neural Network directly to your browser's memory. Your images are never uploaded to our servers, ensuring 100% privacy.
            </p>
            
            {loadingModel ? (
               <div className="w-full py-4 px-4 bg-background border border-border rounded-xl flex items-center gap-3">
                 <Loader2 size={18} className="animate-spin text-secondary" />
                 <span className="text-xs font-semibold text-textMain">Loading AI Engine...</span>
               </div>
            ) : (
              <div className="w-full pt-6 border-t border-border">
                {busy && (
                  <div className="w-full bg-background border border-border rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-secondary h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                )}
                <ToolButton onClick={removeBackground} disabled={!files[0] || busy || loadingModel} className="w-full justify-center bg-secondary hover:bg-secondary/90">
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                  {busy ? `Processing...` : "Remove Background"}
                </ToolButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

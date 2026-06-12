"use client";

import dynamic from "next/dynamic";
import { ToolInfo } from "@/lib/tools";

type ToolWorkspaceProps = {
  tool: ToolInfo;
};

// Dynamic imports for all tools
const AiSummarizerTool = dynamic(() => import("./tools/AiSummarizerTool"));
const AiTitleGeneratorTool = dynamic(() => import("./tools/AiTitleGeneratorTool"));
const BackgroundRemoverTool = dynamic(() => import("./tools/BackgroundRemoverTool"));
const ImageFormatTool = dynamic(() => import("./tools/ImageFormatTool"));
const ImageResizerTool = dynamic(() => import("./tools/ImageResizerTool"));
const ImageToPdfTool = dynamic(() => import("./tools/ImageToPdfTool"));
const JsonFormatterTool = dynamic(() => import("./tools/JsonFormatterTool"));
const PasswordTool = dynamic(() => import("./tools/PasswordTool"));
const PdfCompressTool = dynamic(() => import("./tools/PdfCompressTool"));
const PdfMergeTool = dynamic(() => import("./tools/PdfMergeTool"));
const PdfSplitTool = dynamic(() => import("./tools/PdfSplitTool"));
const PdfToImageTool = dynamic(() => import("./tools/PdfToImageTool"));
const PdfToWordTool = dynamic(() => import("./tools/PdfToWordTool"));
const QrCodeTool = dynamic(() => import("./tools/QrCodeTool"));
const SimpleFormatterTool = dynamic(() => import("./tools/SimpleFormatterTool"));
const TextCaseTool = dynamic(() => import("./tools/TextCaseTool"));
const TextTransformTool = dynamic(() => import("./tools/TextTransformTool"));
const WordCounterTool = dynamic(() => import("./tools/WordCounterTool"));
const WordToPdfTool = dynamic(() => import("./tools/WordToPdfTool"));
const RegexTesterTool = dynamic(() => import("./tools/RegexTesterTool").then(mod => mod.RegexTesterTool));
const VideoCompressorTool = dynamic(() => import("./tools/VideoCompressorTool").then(mod => mod.VideoCompressorTool));
const AudioExtractorTool = dynamic(() => import("./tools/AudioExtractorTool").then(mod => mod.AudioExtractorTool));

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  if (tool.slug === "jpg-to-png" || tool.slug === "png-to-jpg" || tool.slug === "webp-converter") return <ImageFormatTool mode={tool.slug} />;
  if (tool.slug === "image-resizer") return <ImageResizerTool />;
  if (tool.slug === "background-remover") return <BackgroundRemoverTool />;
  if (tool.slug === "video-compressor") return <VideoCompressorTool />;
  if (tool.slug === "audio-extractor") return <AudioExtractorTool />;
  if (tool.slug === "image-to-pdf") return <ImageToPdfTool />;
  if (tool.slug === "merge-pdf") return <PdfMergeTool />;
  if (tool.slug === "split-pdf") return <PdfSplitTool />;
  if (tool.slug === "compress-pdf") return <PdfCompressTool />;
  if (tool.slug === "pdf-to-word") return <PdfToWordTool />;
  if (tool.slug === "word-to-pdf") return <WordToPdfTool />;
  if (tool.slug === "pdf-to-image") return <PdfToImageTool />;
  if (tool.slug === "ai-text-summarizer") return <AiSummarizerTool />;
  if (tool.slug === "ai-title-generator") return <AiTitleGeneratorTool />;
  if (tool.slug === "qr-code-generator") return <QrCodeTool />;
  if (tool.slug === "password-generator") return <PasswordTool />;
  if (tool.slug === "json-formatter") return <JsonFormatterTool />;
  if (tool.slug === "word-counter") return <WordCounterTool />;
  if (tool.slug === "text-case-converter") return <TextCaseTool />;
  if (tool.slug === "regex-tester") return <RegexTesterTool />;
  if (tool.slug === "base64-encoder" || tool.slug === "base64-decoder" || tool.slug === "url-encoder" || tool.slug === "url-decoder") {
    return <TextTransformTool mode={tool.slug} />;
  }
  if (tool.slug === "html-formatter") return <SimpleFormatterTool label="HTML" />;
  if (tool.slug === "css-formatter") return <SimpleFormatterTool label="CSS" />;
  if (tool.slug === "javascript-formatter") return <SimpleFormatterTool label="JavaScript" />;

  return <AiTitleGeneratorTool />;
}

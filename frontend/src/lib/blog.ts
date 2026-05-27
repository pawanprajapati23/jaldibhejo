export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  tags: string[];
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-jaldibhejo-keeps-file-sharing-private",
    title: "How JaldiBhejo Keeps Browser File Sharing Private",
    description:
      "Learn how JaldiBhejo uses peer-to-peer browser technology to send files directly between devices without storing your transfer on our servers.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    readingTime: "5 min read",
    tags: ["Privacy", "WebRTC", "File Sharing"],
    sections: [
      {
        heading: "Direct transfer by design",
        body: [
          "JaldiBhejo is built around WebRTC data channels, a browser technology that can create a direct peer-to-peer connection between two devices. The sender creates a transfer room, the receiver joins with a PIN or QR code, and the browser handles the encrypted connection used to move the file.",
          "The signaling server helps both browsers discover each other, but the actual file payload is sent through the browser connection. This keeps the app lightweight and avoids storing your file as a server-side upload.",
        ],
      },
      {
        heading: "What the PIN does",
        body: [
          "The six-digit PIN is a short-lived connection code. It is meant to help the receiver join the correct transfer session without creating an account or sharing a permanent link.",
          "For best results, share the PIN only with the person receiving your file and avoid posting it publicly. If a transfer looks wrong, cancel it and start a new one.",
        ],
      },
      {
        heading: "Local-first tools",
        body: [
          "JaldiBhejo also includes browser tools such as image compression. These tools run on your device using browser APIs, so the image can be processed without uploading it to a separate conversion server.",
          "This local-first approach is useful for quick preparation before sharing. For example, compressing a large photo before sending it can reduce transfer time and make mobile sharing easier.",
        ],
      },
      {
        heading: "Practical safety tips",
        body: [
          "Peer-to-peer sharing does not replace common sense. Only accept files from people you trust, check file names before saving, and use your operating system's security tools for files from unknown sources.",
          "When receiving important documents, confirm the sender and the file name outside the app as well. A quick message or call can prevent accidental transfers.",
        ],
      },
    ],
  },
  {
    slug: "ultimate-guide-to-peer-to-peer-file-sharing",
    title: "The Ultimate Guide to Peer-to-Peer File Sharing in the Browser",
    description:
      "A practical guide to browser-based P2P file sharing, when to use it, what makes it fast, and how to avoid common transfer problems.",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    readingTime: "6 min read",
    tags: ["Guide", "P2P", "Productivity"],
    sections: [
      {
        heading: "What peer-to-peer file sharing means",
        body: [
          "Peer-to-peer file sharing means files move from one user's device to another user's device instead of first being uploaded to cloud storage. In a browser app, WebRTC makes this possible without asking users to install desktop software.",
          "This is especially useful for quick, one-time transfers: photos, PDFs, ZIP files, notes, and other files that need to move between nearby devices or trusted contacts.",
        ],
      },
      {
        heading: "Why browser P2P can feel faster",
        body: [
          "Cloud upload flows often require two steps: upload from sender to server, then download from server to receiver. A direct browser transfer can reduce that path when both devices are online at the same time.",
          "Performance still depends on both networks, device speed, browser support, and whether a direct route can be established. Large files may still take time, but removing the extra upload step often makes the workflow simpler.",
        ],
      },
      {
        heading: "When to use JaldiBhejo",
        body: [
          "Use JaldiBhejo when you want a fast transfer without account creation, cloud folders, or long-lived public links. The PIN and QR flow is designed for quick sessions where both users are present.",
          "For long-term storage, backups, or sharing with many people over several days, a cloud storage service may still be the better tool. JaldiBhejo is focused on direct handoff, not archive management.",
        ],
      },
      {
        heading: "Tips for reliable transfers",
        body: [
          "Keep both browser tabs open until the transfer finishes. Avoid switching networks in the middle of a transfer, and keep the device awake on mobile.",
          "If a transfer fails, create a new PIN and retry. For very large folders, compressing them into a ZIP or sending a smaller batch can improve reliability.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

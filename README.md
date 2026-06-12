<div align="center">
  <img src="./frontend/public/favicon.ico" alt="JaldiBhejo Logo" width="100" />
  <h1>JaldiBhejo</h1>
  <p><strong>Send Anything, Instantly. No signups. No servers. Just peer-to-peer sharing.</strong></p>
</div>

<hr />

## 👋 Welcome to JaldiBhejo

JaldiBhejo is a lightning-fast, browser-based file-sharing application designed for modern web environments. Whether you need to send a quick text snippet, a large video file, or share your screen, JaldiBhejo connects devices directly via WebRTC. 

Because files are transferred peer-to-peer, they **never touch our servers**. It's secure, private, and works seamlessly across Windows, Mac, iOS, and Android—straight from the browser.

Besides sharing, the app includes a robust suite of local, browser-based utilities (like PDF compression, Image resizing, and AI Text Summarization) to prepare your files before sending.

## ✨ Key Features

- **Direct P2P Transfers:** Powered by WebRTC DataChannels with custom resumable chunking logic.
- **Zero Configuration:** No accounts, no passwords, no app installations required. Just open the link and share via PIN or QR code.
- **Secure & Private:** Files travel directly between sender and receiver. Our signaling server (Firebase) only helps devices find each other.
- **Multi-Modal Sharing:** Share files (auto-zipped for multiple), send raw text, or live-stream your screen.
- **Resilient Connections:** Built-in ping/keep-alive mechanisms to prevent idle timeouts, and chunk-based transfers that support large files.
- **Polished UI/UX:** Clean, responsive design featuring Dark/Light mode, haptic feedback on mobile, and audio cues upon transfer completion.
- **Offline-ready Utilities:** 20+ built-in tools (Image Compressors, PDF Mergers, JSON Formatters) that run entirely in the browser using WebAssembly and Web Workers.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS + CSS Variables for Theme Management
- **State Management:** Zustand
- **Signaling Server:** Firebase (Realtime Database & Anonymous Auth)
- **Core Technology:** WebRTC (RTCPeerConnection, RTCDataChannel)

---

## 🚀 Getting Started Locally

Running JaldiBhejo on your local machine is straightforward.

### 1. Set up Firebase
Since JaldiBhejo uses Firebase purely for signaling (exchanging WebRTC offers/answers):
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Anonymous Authentication** in the Build > Authentication section.
3. Enable **Realtime Database**. Update the database rules to allow read/write for authenticated users:
   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
   ```
4. Copy your Firebase project configuration credentials.

### 2. Configure the Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Copy the environment template
cp .env.example .env.local

# Edit .env.local and paste your Firebase credentials
nano .env.local

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🌍 Deployment

JaldiBhejo is built as a static/serverless Next.js application. The easiest way to deploy is via Vercel.

1. Push this repository to GitHub.
2. Import the project into **Vercel**. Ensure the root directory is set to `frontend`.
3. Add your Firebase environment variables to the Vercel project settings.
4. Deploy!

*(Note: There is no standalone Node.js backend to deploy. Firebase handles all signaling needs.)*

---

## 🏗️ Architecture & Recent Upgrades

We recently overhauled the codebase for production readiness:
- **Component Modularity:** The massive workspace file has been split into 20+ isolated, dynamically imported components (`src/components/tools/`), drastically reducing the initial JS payload.
- **Connection Stability:** Introduced WebRTC keep-alive pings and advanced timeout handling to support networks behind strict corporate NATs/Firewalls.
- **Sensory Feedback:** Integrated haptic vibrations (for supported mobile devices) and audio notifications to confirm transfer completion.
- **Native Theme Support:** Built a lightweight, flicker-free Dark/Light mode using native CSS variables and React Context.

## 🤝 Contributing

Contributions are welcome! Whether it's adding a new browser-based tool, improving WebRTC ICE candidate gathering, or just fixing a typo. Please open an issue first to discuss major changes.

## 📜 License

MIT License. See `LICENSE` for more information.

# JaldiBhejo - Send Anything Instantly

JaldiBhejo is a premium, browser-based cross-platform file-sharing web app. It allows users to send files between devices (iPhone, Android, Windows, Mac) directly from the browser without login or signup.

## 🚀 Features
- **Zero Setup**: No login or signup required.
- **AirDrop-like Experience**: Simple "Send" and "Receive" flow.
- **High Performance**: Direct Peer-to-Peer (WebRTC) transfers for maximum speed.
- **Cross-Platform**: Works on any modern browser (Chrome, Safari, Firefox).
- **Secure**: End-to-end encrypted P2P transfer; files never touch the server.
- **Modern UI**: Glassmorphic design with smooth Framer Motion animations.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js, Socket.IO (Signaling only).
- **Transfer**: WebRTC DataChannels with custom chunking logic.

---

## 📁 Project Structure
- `/jaldibhejo-frontend`: The Next.js web application.
- `/jaldibhejo-backend`: The Node.js signaling server.

## ⚙️ Local Setup

### 1. Backend
```bash
cd jaldibhejo-backend
npm install
npm run dev
```
*Runs on `http://localhost:3001` by default.*

### 2. Frontend
```bash
cd jaldibhejo-frontend
npm install
npm run dev
```
*Runs on `http://localhost:3000` by default.*

---

## 🌍 Deployment Guide

### Backend (Railway / Render / Heroku)
1. Push the `jaldibhejo-backend` folder to a new GitHub repo.
2. Connect the repo to **Railway** or **Render**.
3. Set the `PORT` environment variable (optional, defaults to 3001).
4. **Important**: Copy the deployed URL (e.g., `https://api.jaldibhejo.com`).

### Frontend (Vercel)
1. Push the `jaldibhejo-frontend` folder to a new GitHub repo.
2. Connect the repo to **Vercel**.
3. Add an Environment Variable:
   - `NEXT_PUBLIC_BACKEND_URL`: Your deployed backend URL.
4. Deploy.

---

## 🔒 Security & Privacy
- Files are transferred directly between devices using WebRTC.
- The signaling server only helps devices "find" each other via the 6-digit PIN.
- No files are stored on any server.
- Rooms are ephemeral and auto-deleted after use.

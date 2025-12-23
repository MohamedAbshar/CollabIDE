# CollabIDE 💻⚡

![Status](https://img.shields.io/badge/Status-Work_in_Progress-yellow)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> **Real-time collaborative coding, powered by WebSockets.**

**CollabIDE** is a browser-based code editor that allows developers to code together in real-time. It replaces traditional HTTP polling with persistent WebSocket connections to ensure low-latency synchronization between users in the same room.

**🚧 Note:** This project is currently under active development.

---

## 📸 Preview
![App Preview](https://github.com/MohamedAbshar/CollabIDE/blob/5f3a73ea79832d479290c778aceab5ad64174379/Assets/editor2.png)

---

## ✨ Features (Planned & Implemented)

- [x] **Real-Time Sync:** Instant code updates across all connected clients.
- [x] **Room System:** Users can generate unique Room IDs to collaborate privately.
- [x] **Monaco Editor Integration:** Full VS Code-like editing experience in the browser.
- [ ] **Line Locking:** Visual indicators to prevent users from editing the same line.
- [ ] **Syntax Highlighting:** Support for JavaScript, Python, C++, and Java.
- [ ] **Chat System:** Integrated chat sidebar for team communication.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js + Vite | Fast, component-based UI |
| **Backend** | Python FastAPI | Asynchronous server for handling WebSockets |
| **Editor** | Monaco Editor | The core editor engine used in VS Code |
| **Protocol** | WebSockets | Full-duplex communication channel |

---

## 🚀 Setup & Installation

Follow these instructions to run the project locally.

### Prerequisites
* **Node.js** (v16 or higher)
* **Python** (v3.9 or higher)

### 1. Backend Setup (Python)
The backend handles the WebSocket connections and room management.

```bash
# Navigate to the backend folder
cd backend

# Create and activate a virtual environment (Recommended)
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn websockets

# Start the server
uvicorn main:app --reload --port 8000
```
✅ Server should be running at ws://localhost:8000

### 2. Frontend Setup (React)
The frontend is the user interface where the coding happens.

```bash

# Open a NEW terminal and navigate to the frontend folder
cd frontend

# Install dependencies (React, Xterm, Lucide, etc.)
npm install

# Start the development server
npm run dev
```
✅ Client should be running at http://localhost:5173



📄 License
This project is licensed under the MIT License - see the LICENSE file for details

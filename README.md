# 🤖 AI Contract Management Chatbot

> An intelligent contract management system powered by Llama 2 (Ollama) with a modern glassmorphism UI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)

---

## 📋 Overview

A full-stack contract management application with an AI-powered chatbot assistant. Built with **React (Vite)**, **Node.js (Express)**, and **Ollama (Llama 2 7B)** for local AI inference. Features include contract tracking, expiration alerts, salary management, and conversational AI assistance.

## ✨ Features

### 💼 Contract Management
- ✅ Create, read, update, and delete contracts
- ✅ Track contract status (active, expiring, expired)
- ✅ Automatic status updates based on end dates
- ✅ Salary tracking with INR currency formatting
- ✅ Contract search functionality
- ✅ Client and company management

### 🤖 AI Chatbot Assistant
- ✅ Natural language queries about contracts
- ✅ Salary information retrieval
- ✅ Contract status checks
- ✅ Expiration alerts
- ✅ Conversational interface powered by Llama 2 7B
- ✅ Chat history persistence

### 🎨 Modern UI/UX
- ✅ Glassmorphism design with animated gradients
- ✅ Responsive layout (desktop/tablet/mobile)
- ✅ Smooth animations and transitions
- ✅ Real-time alerts and notifications
- ✅ Premium card-based interface
- ✅ Neon glow effects on status badges

### 🔒 Data Storage
- ✅ Local JSON file storage (no external database required)
- ✅ Contract data persistence
- ✅ Chat history tracking
- ✅ Automatic file initialization

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **CSS3** - Modern styling with glassmorphism
- **Fetch API** - HTTP client

### Backend
- **Node.js 18+** - Runtime environment
- **Express 4** - Web framework
- **CORS** - Cross-origin resource sharing
- **ES Modules** - Modern JavaScript syntax

### AI/ML
- **Ollama** - Local LLM inference server
- **Llama 2 7B** - Language model
- **Native Fetch API** - Ollama integration

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v10.0.0 or higher)
- **Ollama** (for AI functionality)

### Step 1: Install Ollama

Download and install Ollama from [https://ollama.com](https://ollama.com)

Download Llama 2 7B model
```
ollama pull llama2:7b
```

Start Ollama server
```
ollama serve
```


### Step 2: Clone Repository
```
git clone https://github.com/your-username/contract-chatbot.git
cd contract-chatbot
```


### Step 3: Install Dependencies

#### Backend Setup
```
cd backend
npm install
```


#### Frontend Setup

```
cd ../frontend
npm install
```


---

## 🚀 Running the Application

### Start Backend Server

```
cd backend
npm start
```


Backend runs on: `http://localhost:3000`

### Start Frontend Development Server
```
cd frontend
npm run dev
```


Frontend runs on: `http://localhost:5173`

### Make Sure Ollama is Running

```
ollama serve
```


Ollama API runs on: `http://localhost:11434`

---

## 📁 Project Structure

```
contract-chatbot/
├── backend/
│ ├── server.js # Express server
│ ├── package.json # Backend dependencies
│ ├── contracts.json # Contract data storage
│ └── chat_history.json # Chat history storage
├── frontend/
│ ├── src/
│ │ ├── App.jsx # Main React component
│ │ ├── App.css # Styling
│ │ └── main.jsx # Entry point
│ ├── index.html # HTML template
│ ├── package.json # Frontend dependencies
│ └── vite.config.js # Vite configuration
└── README.md # Project documentation
```


---

## 🔧 Configuration

### Backend Configuration

The backend uses the following default ports:
- **API Server:** 3000
- **CORS:** Enabled for all origins (development)

### Frontend Configuration

Update `API_URL` in `frontend/src/App.jsx` if backend port changes:

```
const API_URL = 'http://localhost:3000/api';
```


### Ollama Configuration

Default Ollama settings:
- **Model:** llama2:7b
- **API Endpoint:** http://localhost:11434
- **Stream:** false (non-streaming responses)

---

## 📚 API Documentation

### Contracts

#### Get All Contracts

```
GET /api/contracts
```


#### Create Contract
```
POST /api/contracts
Content-Type: application/json

{
"title": "Quality Assurance",
"company": "VVRN Technologies",
"client_name": "John rohan",
"contract_type": "individual",
"start_date": "2024-03-05",
"end_date": "2025-05-02",
"salary": 500000,
"notes": "Optional notes"
}
```


#### Get Single Contract
```
GET /api/contracts/:id
```

#### Update Contract

```
PUT /api/contracts/:id
```


#### Delete Contract
```
DELETE /api/contracts/:id
```


### Search

#### Search Contracts
```
POST /api/search
Content-Type: application/json

{
"query": "quality assurance"
}
```


### Alerts

#### Get Contract Alerts

```
GET /api/alerts
```


### Chat

#### Send Message to AI
POST /api/chat
Content-Type: application/json
```
{
"message": "What is my salary?",
"chat_id": "optional-chat-id"
}
```


#### Get Chat History
```
GET /api/chat/history/:chat_id
```


---

## 💡 Usage Examples

### Adding a Contract

1. Click **"➕ Add Contract"** in the sidebar
2. Fill in the contract details:
   - Title (position/role) ex:rohan
   - Company name
   - Client name
   - Contract type (individual/client)
   - Start and end dates
   - Salary (optional, in INR)
   - Notes (optional)
3. Click **"💾 Save Contract"**

### Chatting with AI Assistant

Example queries:
- "What is my salary as Quality Assurance?"
- "Show me all expiring contracts"
- "who made this bot is it rohan made this bot?"
- "Tell me about Rohan's contract"
- "When does my rohan's contract end?"
- "List all active contracts"

### Viewing Alerts

The sidebar automatically displays:
- ⚠️ Contracts expiring within 30 days
- ⚠️ Expired contracts
- Days remaining for each contract

---

## 🎨 UI Features

### Glassmorphism Design
- Frosted glass effect with backdrop blur
- Semi-transparent cards with smooth shadows
- Modern gradient backgrounds

### Animations
- Smooth page transitions
- Message slide-in effects
- Button hover effects
- Floating background elements

### Status Badges
- **Active** (Green) - Contract is active
- **Expiring** (Orange) - Less than 30 days remaining
- **Expired** (Red) - Contract has ended

### Responsive Design
- Desktop: Full sidebar + chat
- Tablet: Compact sidebar + chat
- Mobile: Chat only (sidebar hidden)

---

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
Kill process on port 3000 (Windows)
```
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```


**JSON file errors:**
Recreate empty files
```
echo [] > contracts.json
echo {} > chat_history.json
```


### Frontend Issues

**Cannot connect to backend:**
- Ensure backend is running on port 3000
- Check CORS configuration
- Verify API_URL in App.jsx

### Ollama Issues

**Ollama not responding:**
Check if Ollama is running
```
curl http://localhost:11434/api/tags
```
Restart Ollama
```
ollama serve
```

**Model not found:**

List installed models
```
ollama list
```

Pull Llama 2 if missing
```
ollama pull llama2:7b
```


---

## 🔐 Security Considerations

⚠️ **Important:** This is a development application. For production use:

1. Add authentication and authorization
2. Implement input validation and sanitization
3. Use environment variables for configuration
4. Add rate limiting to API endpoints
5. Use a proper database (PostgreSQL, MongoDB)
6. Enable HTTPS
7. Implement proper error handling
8. Add logging and monitoring

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- **Ollama Team** - For the amazing local LLM platform
- **Meta AI** - For the Llama 2 model
- **React Team** - For the excellent UI framework
- **Vite Team** - For the blazing fast build tool

---

## 📊 Project Stats

- **Lines of Code:** ~2,500
- **Components:** 1 main component
- **API Endpoints:** 11
- **Supported Models:** Llama 2 7B
- **UI Design:** Glassmorphism 2025

---

<!-- Author: Full Stack Developer -->
<!-- Version: 1.0.0 -->
<!-- Last Updated: October 2025 -->
<!-- Built using React, Node.js, and Ollama -->





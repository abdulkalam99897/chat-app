💬 Real-Time Chat App (React Native + Node.js)
📌 Overview

This is a real-time one-to-one chat application built as part of a Software Engineering assignment.
It allows users to register, log in, start private chats, send/receive messages instantly, and view typing and read receipts.

🧠 Tech Stack

Frontend: React Native (Expo)

Backend: Node.js + Express + Socket.IO

Database: MongoDB Atlas (Cloud)

Auth: JWT-based authentication

⚙️ Project Structure
chat-app/
│
├── mobile/        # React Native app (Expo)
│   ├── screens/   # Login, Register, Chat, Home
│   ├── SocketContext.js
│   └── App.js
│
├── server/        # Node.js backend (Express + Socket.IO)
│   ├── routes/    # auth, users, conversations
│   ├── models/    # User, Message, Conversation
│   └── index.js
│
├── .gitignore
└── README.md

🛠️ Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/abdulkalam99897/chat-app.git
cd chat-app

2️⃣ Backend Setup
cd server
npm install
# Create .env file (use .env.example as a guide)
node index.js


Your backend will run on http://localhost:5000

3️⃣ Mobile Setup
cd ../mobile
npm install
npx expo start


Scan the QR code with Expo Go to open the app.

🌍 Environment Variables

Add the following in a .env file inside /server:

MONGO_URI=mongodb+srv://abdul:cVcNE8Z6fv5QgBuQ@cluster0.nt9gf7j.mongodb.net/chat-app?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key
PORT=5000


👥 Sample Test Users
Email	Password
user1@example.com
	123456
user2@example.com
	123456

  
🧩 Features

✅ Register / Login (JWT)
✅ User List (View all users)
✅ 1-to-1 Chat Rooms
✅ Real-time Messaging via Socket.IO
✅ Typing Indicators (typing:start | typing:stop)
✅ Read Receipts (message:read)
✅ MongoDB Atlas data persistence

🧑‍💻 Author

Abdul Kalam

📅 Submitted on: 11 November 2025
📝 Note: Demo video not included; full source code and documentation provided.

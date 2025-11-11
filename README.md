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
<img width="483" height="671" alt="image" src="https://github.com/user-attachments/assets/95a74fc7-b95f-490a-b1dc-2c92cb43fac7" />


<img width="1080" height="2340" alt="image" src="https://github.com/user-attachments/assets/3fa7cbc6-096b-4e4e-999a-7ae30bd029a2" />

<img width="1080" height="2340" alt="image" src="https://github.com/user-attachments/assets/5b601c20-15c5-4766-8360-12556c12c0a4" />


<img width="738" height="1600" alt="image" src="https://github.com/user-attachments/assets/2a52a963-80c0-46a9-8f91-13af5dccda5a" />

<img width="1080" height="2340" alt="image" src="https://github.com/user-attachments/assets/9c614e9e-1da3-447a-bff9-30f8d24814c1" />




🌍 Environment Variables

Add the following in a .env file inside /server:

MONGO_URI=mongodb+srv://abdul:cVcNE8Z6fv5QgBuQ@cluster0.nt9gf7j.mongodb.net/chat-app?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key
PORT=5000


👥 Sample Test Users
Email and  password
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

// ✅ Load environment variables
require("dotenv").config();
console.log("🔍 Loaded MONGO_URI:", process.env.MONGO_URI);
console.log("🔍 Loaded PORT:", process.env.PORT);

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// ✅ Import routes and models
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const convRoutes = require("./routes/conversations");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Chat App Server is running fine!");
});

// ✅ JWT Middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token provided" });

  const parts = auth.split(" ");
  if (parts.length !== 2)
    return res.status(401).json({ message: "Invalid token format" });

  const token = parts[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "replace_with_a_strong_secret"
    );
    req.userId = payload.id;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ✅ Server setup
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const onlineUsers = new Map();

// ✅ Socket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next();
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "replace_with_a_strong_secret"
    );
    socket.userId = payload.id;
  } catch (err) {
    console.error("Socket auth failed:", err.message);
  }
  next();
});

// ✅ Main Socket.IO logic
io.on("connection", (socket) => {
  if (socket.userId) {
    const list = onlineUsers.get(socket.userId) || new Set();
    list.add(socket.id);
    onlineUsers.set(socket.userId, list);
    io.emit("user:status", { userId: socket.userId, online: true });
    console.log(`✅ User ${socket.userId} connected`);
  }

  // ✅ Message sending event
  socket.on("message:send", async (data, cb) => {
    try {
      console.log("📩 New message received from client:", data);

      // Create message in DB
      const msg = await Message.create({
        conversation: data.conversationId,
        from: data.from || socket.userId,
        to: data.to,
        text: data.text,
        status: "sent",
        createdAt: new Date(),
      });

      // Emit message to sender immediately
      io.to(socket.id).emit("message:new", msg);

      // Deliver to receiver if online
      const receiverSockets = onlineUsers.get(String(data.to));
      if (receiverSockets && receiverSockets.size > 0) {
        await Message.findByIdAndUpdate(msg._id, { status: "delivered" });
        const updated = await Message.findById(msg._id).lean();

        // Send to all active sockets of receiver
        for (const sock of receiverSockets) {
          io.to(sock).emit("message:new", updated);
        }

        // Notify sender of delivery
        io.to(socket.id).emit("message:delivered", {
          messageId: msg._id,
          to: data.to,
        });
      }

      // Acknowledge sender
      if (cb) cb({ ok: true, message: msg });
    } catch (err) {
      console.error("❌ Message send error:", err);
      if (cb) cb({ ok: false, error: err.message });
    }
  });

  // ✅ Typing indicators
  socket.on("typing:start", (payload) =>
    io.emit("typing", { ...payload, typing: true })
  );
  socket.on("typing:stop", (payload) =>
    io.emit("typing", { ...payload, typing: false })
  );

  // ✅ Message read receipts
  socket.on("message:read", async (payload) => {
    try {
      await Message.findByIdAndUpdate(payload.messageId, { status: "read" });
      io.emit("message:read", payload);
    } catch (err) {
      console.error("Message read update failed:", err);
    }
  });

  // ✅ Handle disconnects
  socket.on("disconnect", () => {
    if (socket.userId) {
      const list = onlineUsers.get(socket.userId);
      if (list) {
        list.delete(socket.id);
        if (list.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit("user:status", { userId: socket.userId, online: false });
          console.log(`❌ User ${socket.userId} disconnected`);
        } else {
          onlineUsers.set(socket.userId, list);
        }
      }
    }
  });
});

// ✅ Attach routes
app.use("/auth", authRoutes);
app.use("/users", authMiddleware, userRoutes);
app.use("/conversations", authMiddleware, convRoutes);

// ✅ MongoDB Connection + Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    server.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

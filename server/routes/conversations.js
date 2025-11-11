const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// ✅ Get or create a conversation between two users
router.get("/start/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    // Ensure both user IDs exist
    if (!user1 || !user2) {
      return res.status(400).json({ message: "User IDs required" });
    }

    // ✅ Check if a conversation already exists
    let conv = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    });

    // ✅ If not found, create a new conversation
    if (!conv) {
      conv = await Conversation.create({ participants: [user1, user2] });
    }

    // ✅ Safely fetch the last message
    const lastMessage = await Message.findOne({ conversation: conv._id })
      .sort({ createdAt: -1 })
      .lean()
      .catch(() => null);

    res.json({
      _id: conv._id,
      participants: conv.participants,
      lastMessage: lastMessage || null,
    });
  } catch (err) {
    console.error("❌ Conversation fetch/create error:", err);
    res.status(500).json({ message: "Server error creating/fetching conversation" });
  }
});

// ✅ Fetch all messages for a conversation
router.get("/:id/messages", async (req, res) => {
  try {
    const convId = req.params.id;
    const userId = req.userId || null;

    if (!convId) {
      return res.status(400).json({ message: "Conversation ID missing" });
    }

    // ✅ Fetch all messages (sorted)
    const messages = await Message.find({ conversation: convId })
      .sort({ createdAt: 1 })
      .lean();

    // ✅ Mark messages as read if user is valid
    if (userId) {
      await Message.updateMany(
        { conversation: convId, to: userId, status: { $ne: "read" } },
        { $set: { status: "read" } }
      );
    }

    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// ✅ Send a message manually (optional, for testing)
router.post("/:id/messages", async (req, res) => {
  try {
    const { from, to, text } = req.body;
    const convId = req.params.id;

    if (!from || !to || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const msg = await Message.create({
      conversation: convId,
      from,
      to,
      text,
      status: "sent",
    });

    res.json(msg);
  } catch (err) {
    console.error("❌ Message send error:", err);
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = router;

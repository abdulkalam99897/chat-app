const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [String], // stores the two user IDs
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Correct export
module.exports = mongoose.model("Conversation", ConversationSchema);

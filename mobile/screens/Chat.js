import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SocketContext } from "../SocketContext";

const API_BASE = "http://192.168.0.6:5000"; // ⚡ your backend IP

export default function Chat({ route, navigation }) {
  const { toUser } = route.params;
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [lastSentId, setLastSentId] = useState(null); // ✅ Prevent duplicates

  const meRef = useRef(null);
  const flatListRef = useRef(null);

  // ✅ Initialize Chat
  useEffect(() => {
  const initChat = async () => {
    const userJson = await AsyncStorage.getItem("user");
    const me = JSON.parse(userJson);
    meRef.current = me;
    navigation.setOptions({ title: toUser.name });
    const token = await AsyncStorage.getItem("token");

    try {
      // ✅ Get or create conversation
      const convRes = await axios.get(
        `${API_BASE}/conversations/start/${me._id}/${toUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const conv = convRes.data;
      setConversationId(conv._id);

      // ✅ Fetch all old messages
      const msgRes = await axios.get(
        `${API_BASE}/conversations/${conv._id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(msgRes.data || []);
    } catch (err) {
      console.error("❌ Chat init error:", err.message);
    }
  };

  initChat();

  // ✅ Handle new incoming messages in real-time
  const handleNewMessage = (msg) => {
    if (msg.conversation === conversationId) {
      setMessages((prev) => {
        // avoid duplicates
        const exists = prev.find((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  socket?.on("message:new", handleNewMessage);

  return () => {
    socket?.off("message:new", handleNewMessage);
  };
}, [conversationId]);


  // ✅ Send a message
  const send = () => {
    if (!text.trim() || !conversationId) return;

    const msgId = Date.now().toString();
    setLastSentId(msgId);

    const msgData = {
      _id: msgId,
      conversationId,
      from: meRef.current._id,
      to: toUser._id,
      text: text.trim(),
      status: "sending",
      createdAt: new Date(),
    };

    // ✅ Add locally only once
    setMessages((prev) => [...prev, msgData]);

    socket.emit("message:send", msgData, (ack) => {
      if (ack?.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgData._id ? { ...ack.message, status: "sent" } : m
          )
        );
      } else {
        console.error("❌ Message send failed:", ack?.error);
      }
    });

    setText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ✅ Render each message bubble
  const renderItem = ({ item }) => {
    const mine = String(item.from) === String(meRef.current._id);
    return (
      <View style={[styles.msg, mine ? styles.mine : styles.theirs]}>
        <Text style={{ color: mine ? "#fff" : "#000" }}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 70 : 90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* ✅ Input Box always visible above keyboard */}
        <View style={styles.inputContainer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            style={styles.input}
          />
          <TouchableOpacity style={styles.sendButton} onPress={send}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  msg: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  mine: {
    backgroundColor: "#0084ff",
    alignSelf: "flex-end",
  },
  theirs: {
    backgroundColor: "#f1f0f0",
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#0084ff",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

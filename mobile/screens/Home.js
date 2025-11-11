import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SocketContext } from "../SocketContext";

const API_BASE = "http://192.168.0.6:5000"; // ✅ your backend IP

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineMap, setOnlineMap] = useState({});
  const [loading, setLoading] = useState(true);
  const socket = useContext(SocketContext);

  const fetchUsers = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");
      const me = JSON.parse(userJson);
      setUser(me);

      // ✅ Fetch all users
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const others = res.data.filter((u) => u._id !== me._id);
      setUsers(others);
    } catch (err) {
      console.error("❌ Error fetching users:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    socket?.on("user:status", (payload) => {
      setOnlineMap((prev) => ({
        ...prev,
        [payload.userId]: payload.online,
      }));
    });

    return () => {
      socket?.off("user:status");
    };
  }, []);

  // ✅ Logout Function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err) {
      Alert.alert("Logout Failed", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0084ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>Welcome, {user?.name?.split(" ")[0]} 👋</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchUsers} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => navigation.navigate("Chat", { toUser: item })}
          >
            <View style={styles.row}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: onlineMap[item._id] ? "#2ecc71" : "#bbb" },
                ]}
              />
              <Text style={styles.userName}>{item.name}</Text>
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0084ff",
  },
  logoutBtn: {
    backgroundColor: "#ff4d4d",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },
  userItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  userName: { fontSize: 16, fontWeight: "600", color: "#333" },
  userEmail: { color: "#777", fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
});

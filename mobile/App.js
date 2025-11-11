import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { View, ActivityIndicator } from "react-native";

import Login from "./screens/Login";
import Register from "./screens/Register";
import Home from "./screens/Home";
import Chat from "./screens/Chat";

import { SocketContext } from "./SocketContext";

const Stack = createNativeStackNavigator();

export default function App() {
  const [socket, setSocket] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const SERVER_URL = "http://192.168.0.6:5000";

        const s = io(SERVER_URL, {
          autoConnect: false,
          auth: { token },
          transports: ["websocket"],
        });

        if (token) {
          s.connect();
          console.log("✅ Socket connected to", SERVER_URL);
          setInitialRoute("Home");
        } else {
          console.log("⚠️ No token found — redirecting to Login");
          setInitialRoute("Login");
        }

        setSocket(s);
      } catch (err) {
        console.error("❌ Socket initialization failed:", err);
      } finally {
        setIsReady(true);
      }
    };

    initialize();

    return () => {
      socket?.disconnect();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0084ff" />
      </View>
    );
  }

  return (
    <SocketContext.Provider value={socket}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              title: "Chats",
              headerStyle: { backgroundColor: "#0084ff" },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={({ route }) => ({
              title: route.params?.toUser?.name || "Chat",
              headerStyle: { backgroundColor: "#0084ff" },
              headerTintColor: "#fff",
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketContext.Provider>
  );
}

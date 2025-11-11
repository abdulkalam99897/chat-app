import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Your backend IP (same as server)
const API_BASE = 'http://192.168.0.6:5000';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      console.log('✅ Login response:', res.data);

      if (res.data.token && res.data.user) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

        Alert.alert('Success', `Welcome ${res.data.user.name}!`, [
          {
            text: 'OK',
            onPress: () => navigation.replace('Home'),
          },
        ]);
      } else {
        Alert.alert('Login Failed', 'Invalid response from server.');
      }
    } catch (err) {
      console.error('❌ Login error:', err.response?.data || err.message);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <Text>Password</Text>
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0084ff" style={{ marginVertical: 10 }} />
      ) : (
        <Button title="Login" onPress={login} />
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don’t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login; // ✅ This must exist!

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0084ff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#0084ff',
    fontSize: 15,
  },
});

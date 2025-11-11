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

// ✅ Your backend IP (from ipconfig)
const API_BASE = 'http://192.168.0.6:5000';

export default function Register({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/auth/register`, {
        name,
        email,
        password,
      });

      console.log('✅ Register response:', res.data);

      if (res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Registered successfully! Please login.');
        navigation.goBack();
      }
    } catch (err) {
      console.error('❌ Register error:', err.response?.data || err.message);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>

      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

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
        <Button title="Register" onPress={register} />
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

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

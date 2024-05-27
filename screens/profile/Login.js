import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { auth } from '../../Firebase/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        // If userToken exists in AsyncStorage, navigate to Profile screen
        navigation.navigate('Profile');
      }
    } catch (error) {
      console.error('Error reading userToken from AsyncStorage:', error);
    }
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Save user token to local storage upon successful login
      const userToken = userCredential.user.accessToken;
      await AsyncStorage.setItem('userToken', userToken);
      alert('User logged in successfully');
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View><Text style={{fontSize:30,fontWeight:'bold'}}>Login</Text></View>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'tomato',
    width: '100%',
  },
  contentContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    height: 300
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#007bff',
    width: '100%',
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;

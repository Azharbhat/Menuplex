import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { auth, database } from '../../Firebase/FirebaseConfig';
import { ref, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState(''); // New state for address
  const [phoneNumber, setPhoneNumber] = useState(''); // New state for phone number
  const [showLogin, setShowLogin] = useState(false);

  const handleRegister = async () => {
    try {
      if (!email || !password || !username || !address || !phoneNumber) { // Check if all fields are filled
        throw new Error('Please fill in all fields');
      }
      // Register the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user data to the database
      if (userCredential.user) {
        const userId = userCredential.user.uid;
        const newUserRef = ref(database, `users/${userId}`);
        const userData = {
          userId: userId,
          email: email,
          username: username,
          address: address, // Save address
          phoneNumber: phoneNumber, // Save phone number
        };
        await set(newUserRef, userData);
        
        // Save user token to AsyncStorage
        await AsyncStorage.setItem('userToken', userCredential.user.accessToken);

        alert('User registered successfully');
        navigation.navigate('Profile');
      }
    } catch (error) {
      console.error('Registration failed:', error.message);
      alert('Registration failed: ' + error.message);
    }
  };

  const toggleLogin = () => {
    setShowLogin(!showLogin);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Let's Eat</Text>
      <Text style={styles.headerText}>Welcome</Text>
      <Text style={styles.headerText}>Register</Text>
      {!showLogin ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
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
          <TextInput
            style={styles.input}
            placeholder="Address" // Add address field
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number" // Add phone number field
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleLogin}>
            <Text style={styles.toggleText}>Already have an Account? Login</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View /> // Show the Login component
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'tomato',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '80%',
    height: 40,
    backgroundColor: '#007bff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default Register;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from Expo

const UpdateDetails = ({ onUpdate, onClose, data }) => {
  const [username, setUsername] = useState(data.userName);
  const [email, setEmail] = useState(data.email);
  const [address, setAddress] = useState(data.address);
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber);

  const handleUpdate = () => {
    const updatedData = {
      username: username,
      email,
      address,
      phoneNumber,
    };
    onUpdate(updatedData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Details</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="home" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="call" size={24} color="black" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UpdateDetails;

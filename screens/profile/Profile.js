import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ImageBackground } from 'react-native';
import { useNavigation ,useFocusEffect} from '@react-navigation/native';
import { auth, database } from '../../Firebase/FirebaseConfig';
import { signOut } from '@firebase/auth';
import { ref, get, update } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import UpdateDetails from './UpdateDetails';
import { decode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';


const decodeJwtToken = (token) => {
  try {
    if (!token) {
      console.error('Token is null or empty');
      return null;
    }

    const payload = token.split('.')[1];
    const decodedPayload = decode(payload);
    const decodedToken = JSON.parse(decodedPayload);

    if (!decodedToken || !decodedToken.sub) {
      console.error('Decoded token is null or missing "sub" property');
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [key, setKey] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateIcon, setUpdateIcon] = useState('create');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);

  const reloadUserData = async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        const decodedToken = decodeJwtToken(userToken);
        const userId = decodedToken.sub;
        console.log("User ID:", userId);
        
        const databaseRef = ref(database, 'users');
        const snapshot = await get(databaseRef);
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            if (userData.userId === userId) {
              setUserData(userData);
              setKey(childSnapshot.key);
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }).start();
            }
          });
        } else {
          console.warn('No data available in the database');
        }
      } else {
        navigation.navigate('Login');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.warn('Error checking user login:', error);
    }
  };

  useEffect(() => {
    reloadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      reloadUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpdateDetails = async () => {
    setShowUpdate((prevState) => !prevState);
    setUpdateIcon((prevState) => (prevState === 'create' ? 'close' : 'create'));
  };

  const handleUpdate = async (updatedData) => {
    try {
      await update(ref(database, `users/${key}`), updatedData);
      console.log('User details updated successfully');
      reloadUserData(); // Reload user data after update
      handleUpdateDetails();
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };
//console.log(userData)
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../images/background.jpg')}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>MenuPlex</Text>
          <TouchableOpacity onPress={handleLogout} style={{ display: 'flex', flexDirection: 'row' }}>
            <Text style={{ textAlign: 'center', paddingTop: 10 }}>LogOut</Text>
            <Ionicons name="log-out" size={24} color="white" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <View style={styles.userInfoContainer}>
            <TouchableOpacity onPress={handleUpdateDetails}>
              <Ionicons name={updateIcon} size={24} color="white" style={styles.icon} />
            </TouchableOpacity>
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle" size={24} color="black" style={styles.icon} />
                <Text style={styles.userInfoText}>{userData ? userData.username : ''}</Text>
              </View>
              <View style={styles.userInfo}>
                <Ionicons name="mail" size={24} color="black" style={styles.icon} />
                <Text style={styles.userInfoText}>{userData ? userData.email : ''}</Text>
              </View>
              <View style={styles.userInfo}>
                <Ionicons name="home" size={24} color="black" style={styles.icon} />
                <Text style={styles.userInfoText}>{userData ? userData.address : ''}</Text>
              </View>
              <View style={styles.userInfo}>
                <Ionicons name="call" size={24} color="black" style={styles.icon} />
                <Text style={styles.userInfoText}>{userData ? userData.phoneNumber : ''}</Text>
              </View>
            </Animated.View>
          </View>
        </View>
        {showUpdate && (
          <UpdateDetails
            onUpdate={handleUpdate}
            onClose={handleUpdateDetails}
            data={{
              userName: userData.username,
              email: userData.email,
              address: userData.address,
              phoneNumber: userData.phoneNumber
            }}
          />
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    paddingHorizontal:10,
    paddingVertical:60
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    width:'30%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfoText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
  icon: {
    padding: 10,
  },
});

export default Profile;

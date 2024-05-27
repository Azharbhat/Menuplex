import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { database } from '../../Firebase/FirebaseConfig'; // Assuming you have FirebaseConfig set up
import { ref, get } from 'firebase/database';
import { decode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDataa } from '../../DataContex/DataContex';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

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

// Custom StarRating component
const StarRating = ({ rating }) => {
  const integerPart = Math.floor(rating);
  const decimalPart = rating - integerPart;

  const stars = [];

  // Add colored star for the integer part
  for (let i = 0; i < integerPart; i++) {
    stars.push(<FontAwesome key={i} name="star" size={20} color="gold" />);
  }

  // Add half star if decimal part is greater than 0
  if (decimalPart > 0) {
    stars.push(<FontAwesome key="half" name="star-half-full" size={20} color="gold" />);
  }

  // Add bordered stars for the remaining part
  const remainingStars = 5 - stars.length;
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<FontAwesome key={i + 5} name="star-o" size={20} color="gold" />);
  }

  return (
    <View style={{ flexDirection: 'row' }}>
      {stars}
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data, setData } = useDataa();
  const [userLocation, setUserLocation] = useState(null);

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
            const user = childSnapshot.val();
            if (user.userId === userId) {
              setData(user);
            }
          });
        } else {
          console.warn('No data available in the database');
        }
      } else {
        // navigation.navigate('Login');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.warn('Error checking user login:', error);
    }
  };

  useEffect(() => {
    reloadUserData();
    handleReadData(); // Call handleReadData directly, no need to wait for the effect to run
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      reloadUserData();
      handleReadData(); // Call handleReadData directly, no need to wait for the effect to run
    }, [])
  );

  const handleReadData = async () => {
    const db = database;
    try {
      const usersRef = ref(db, 'Restaurants');
      const snapshot = await get(usersRef);
  
      if (snapshot.exists()) {
        const userDataArray = [];
  
        snapshot.forEach(childSnapshot => {
          const userId = childSnapshot.key;
          const user = childSnapshot.val();
          if (user.hasOwnProperty('restaurantName')) {
            const { id, name, image, restaurantName, category, status, geoLocation } = user;
            const restaurant = {
              userId: userId,
              id,
              geoLocation: user.geoLocation,
              homeDelivery: user.homeDelivery,
              likes: user.likes || 0,
              dislikes: user.dislikes || 0,
              name,
              image,
              restaurantName,
              category,
              rating: user.Rating || 0,
              address: user.address || '',
              closingTime: user.closingTime || '',
              openingTime: user.openingTime || '',
              phoneNumber: user.phoneNumber || '',
              status: user.status || ''
            };
  
            userDataArray.push(restaurant);
          }
        });
  
        // Sort the restaurants based on distance if user location is available
        if (userLocation) {
          userDataArray.sort((a, b) => {
            const distanceA = calculateDistance(userLocation.latitude, userLocation.longitude, a.geoLocation.coords.latitude, a.geoLocation.coords.longitude);
            const distanceB = calculateDistance(userLocation.latitude, userLocation.longitude, b.geoLocation.coords.latitude, b.geoLocation.coords.longitude);
            return distanceA - distanceB;
          });
        }
  
        setAllRestaurants(userDataArray);
        setUserData(userDataArray); // Set both data states to the same array
      } else {
        setAllRestaurants([]);
        setUserData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  const searchRestaurants = () => {
    const filteredRestaurants = allRestaurants.filter(item =>
      item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setUserData(filteredRestaurants);
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
    setUserData(allRestaurants);
  };

  const countLikes = (likes) => {
    if (likes) {
      const likesArray = Object.values(likes);
      return likesArray.filter(liked => liked).length;
    } else {
      return 0;
    }
  };

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log('User location:', location.coords);

      return { latitude: location.coords.latitude, longitude: location.coords.longitude };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const userLocation = await getLocation();
        console.log('User location:', userLocation);
        setUserLocation(userLocation);
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    fetchUserLocation();
  }, []);

  const getDistance = (lat, lon) => {
    if (userLocation && userLocation.latitude && userLocation.longitude && lat && lon) {
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, lat, lon);
      return distance.toFixed(2) + ' km';
    }
    return '';
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../images/background.jpg')}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.title}>MenuPlex</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Search restaurant..."
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              searchRestaurants(text);
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearchQuery}>
              <FontAwesome name="times-circle" size={30} color="white" />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          style={{ width: '100%' }}
          data={userData}
          keyExtractor={(item, index) => item.userId || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('Detailed', { id: item.id, name: item.restaurantName, key: item.userId })}
            >
              <ImageBackground
                source={item.image ? { uri: item.image } : null}
                style={[styles.backgroundImage, { backgroundColor: 'tomato' }]}
              >
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '60%' }}>
                    <Text style={{ textAlign: 'center', fontSize: 30, fontWeight: '900', color: 'white', width: '100%' }}>{item.restaurantName}</Text>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                      <StarRating rating={(countLikes(item.likes) / countLikes(item.likes) + countLikes(item.dislikes)) * 5} />
                      <FontAwesome name="heart" size={20} color="red" style={{ marginLeft: 5 }} />
                      <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 4 }}>{countLikes(item.likes)}</Text>
                      {item.geoLocation && item.geoLocation.coords && (
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                         
                          <Text style={{ color: 'white', fontSize: 15, fontWeight: '700', marginLeft: 4 }}>
                            {getDistance(item.geoLocation.coords.latitude, item.geoLocation.coords.longitude)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.itemContent}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemText}>{item.address}</Text>
                    </View>
                    <View style={styles.itemLeft}>
                      <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <FontAwesome name="home" size={20} color="tomato" style={{ marginLeft: 5 }} />
                        <Text style={styles.itemText}>{(item.homeDelivery) ? "Available" : "Not Available"}</Text>
                      </View>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemText}>{item.status}</Text>
                      <Text style={styles.itemText}>{item.openingTime} - {item.closingTime}</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />
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
    paddingHorizontal: 10,
    paddingVertical: 30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  clearButton: {
    marginHorizontal: 5
  },
  item: {
    width: '100%',
    height: 'auto',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
  },
  itemLeft: { flex: 3 },
  itemRight: {
    width: '100%',
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Adjust opacity as needed
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 10,
  },
  itemText: {
    fontSize: 12,
    paddingTop: 4,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default HomeScreen;

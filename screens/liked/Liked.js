import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground } from 'react-native';
import { ref, get, child } from 'firebase/database';
import { database } from '../../Firebase/FirebaseConfig'; // Import your Firebase configuration
import { auth } from '../../Firebase/FirebaseConfig'; // Import auth from Firebase for user authentication
import { useDataa } from '../../DataContex/DataContex'; // Import useDataa from DataContex

const Liked = ({ navigation }) => {
  const [likedRestaurants, setLikedRestaurants] = useState([]);
  const [likedFoods, setLikedFoods] = useState([]);
  const [selectedButton, setSelectedButton] = useState('food'); // Changed the initial selected button to 'food'
  const { data, setData } = useDataa(); // Using useDataa hook to access data and setData

  useEffect(() => {
    if (data) {
      // Fetch liked restaurants
      const restaurantsRef = ref(database, 'Restaurants');
      get(restaurantsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const restaurantsData = snapshot.val();
            const likedRestaurantsArray = [];
            // Iterate over each restaurant
            Object.keys(restaurantsData).forEach(restaurantId => {
              const restaurant = restaurantsData[restaurantId];
              // Check if the current user has liked this restaurant
              if (restaurant.likes && restaurant.likes[data.userId]) {
                likedRestaurantsArray.push({
                  id: restaurantId,
                  name: restaurant.restaurantName, // Assuming your restaurant data has a 'name' property
                  image: restaurant.image, // Assuming your restaurant data has an 'image' property
                });
              }
            });
            setLikedRestaurants(likedRestaurantsArray);
          }
        })
        .catch((error) => {
          console.error('Error fetching liked restaurants:', error);
        });
      // Fetch liked foods
      const likedFoodsRef = ref(database, `users/${data.userId}/likedFoods`);
      get(child(likedFoodsRef, '/'))
        .then((snapshot) => {
          if (snapshot.exists()) {
            const likedFoodsData = snapshot.val();
            const likedFoodsArray = Object.keys(likedFoodsData).map(foodId => ({
              id: foodId,
              foodname: likedFoodsData[foodId].foodname, // Assuming your liked foods have a 'name' property
              restaurantKey: likedFoodsData[foodId].restaurantKey, // Assuming your liked foods have an 'image' property
            }));
            setLikedFoods(likedFoodsArray);
          }
        })
        .catch((error) => {
          console.error('Error fetching liked foods:', error);
        });
    }
  }, [selectedButton]);
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../images/background.jpg')} // Path to your image file
        style={styles.background}
      >
        <Text style={{ textAlign: 'center', fontSize: 20, color: 'white', fontWeight: 'bold' }}>Liked</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, selectedButton === 'allRestaurants' ? styles.selectedButton : null]}
            onPress={() => setSelectedButton('allRestaurants')}
          >
            <Text style={[styles.buttonText, selectedButton === 'allRestaurants' ? styles.selectedButtonText : null]}>
              Restaurants
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, selectedButton === 'food' ? styles.selectedButton : null]} // Changed the comparison to 'food'
            onPress={() => setSelectedButton('food')} // Changed the button action to set selectedButton to 'food'
          >
            <Text style={[styles.buttonText, selectedButton === 'food' ? styles.selectedButtonText : null]}>
              Food
            </Text>
          </TouchableOpacity>
        </View>
        {
          selectedButton === 'food' && (<>
            <FlatList
          style={{ width: '100%' }}
          data={likedFoods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('Detailed', { name: item.name, key: item.restaurantKey })}
            >
              <ImageBackground source={{ uri: item.image }} style={styles.backgroundImage}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemText}>{item.foodname}</Text>
                  <Text style={styles.itemText}>{}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />
            
            </>)
        }
        {
          selectedButton!='food' && (<>
            <FlatList
            style={{ width: '100%' }}
            data={likedRestaurants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate('Detailed', { name: item.name, key: item.id })}
              >
                <ImageBackground source={{ uri: item.image }} style={styles.backgroundImage}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemText}>{item.name}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            )}
          />
            
            </>)
        }
        
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
    paddingVertical: 20
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
  },
  selectedButton: {
    borderBottomColor: 'tomato',
    backgroundColor: 'tomato',
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 15,
    color: 'gray',
  },
  selectedButtonText: {
    color: 'white',
  },
  item: {
    width: '100%',
    height: 100,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  itemText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Liked;

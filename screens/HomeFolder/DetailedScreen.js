import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { database } from '../../Firebase/FirebaseConfig';
import { ref, get } from 'firebase/database';
import { Font } from 'expo';


const DetailedScreen = ({ navigation, route }) => {
  const { id, name, key ,orderType} = route.params;
  const [categories, setCategories] = useState([]);
  const [selectedButton, setSelectedButton] = useState('available');

  useEffect(() => {
    handleReadData();
  }, []);

  const handleReadData = async () => {
    const db = database;
    try {
      const categoriesRef = ref(db, `Restaurants/${key}/categories`);
      const snapshot = await get(categoriesRef);

      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesArray = [];

        Object.keys(categoriesData).forEach(categoryId => {
          const category = categoriesData[categoryId];
          categoriesArray.push({ id: categoryId, ...category });
        });

        setCategories(categoriesArray);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleButtonPress = (buttonType) => {
    setSelectedButton(buttonType);
  };
  const filteredCategories = categories.filter(category => {
    if (selectedButton === 'all') {
      return true; // Show all categories
    } else if (selectedButton === 'available') {
      // Check if the availability is true or 'true'
      return category.availability === true || category.availability === 'true'; 
    }
  });
  console.log(orderType,'dfdfd')
  return (
    <View style={styles.container}>
    <ImageBackground
    source={require('../../images/background.jpg')} // Path to your image file
    style={styles.background}
  >
      <Text style={styles.restaurantName}>{name}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, selectedButton === 'all' ? styles.selectedButton : null]}
          onPress={() => handleButtonPress('all')}
        >
          <Text style={styles.buttonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedButton === 'available' ? styles.selectedButton : null]}
          onPress={() => handleButtonPress('available')}
        >
          <Text style={styles.buttonText}>Available</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={{ width: '100%' }}
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Subdetailed', {Ckey:item.id, name: item.name, id: key, selectedButton: selectedButton,orderType:orderType ,restaurantKey:key })}
          >
            <ImageBackground source={{ uri: item.image }} style={styles.backgroundImage}>
              <View style={styles.itemContent}>
                <View style={styles.itemLeft}>
                <Text style={styles.itemText}>{item.name.toUpperCase()}</Text>

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
    paddingHorizontal:10,
    paddingVertical:20
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    width: '48%', // Adjust the width to fit both buttons
    display: 'inline-block',
    textAlign: 'center',
    color: 'black',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    marginBottom: '10px',
    marginRight: '2%',
    boxSizing: 'border-box',
    fontWeight: 'bold',
  },
  
  selectedButton: {
    backgroundColor: 'tomato',
    borderBottomWidth:3,
    color: 'white',
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'none', // Corrected property
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
  },
  itemLeft: {},
  itemText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'tomato',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    // Change the font family as per your preference
  },
  
});

export default DetailedScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Modal, ImageBackground } from 'react-native';
import { ref, get } from 'firebase/database';
import { auth, database } from '../../Firebase/FirebaseConfig';
import { useCartData } from '../../DataContex/CartDataContex';
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

const SubdetailedScreen = ({ route, navigation }) => {
  const { cartData, setCartData } = useCartData();
  const { Ckey, name, id, selectedButton,restaurantKey,orderType } = route.params;
  const [foods, setFoods] = useState([]);
  const [order, setOrder] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [display, setDisplay] = useState(selectedButton === "available" ? 'flex' : 'none');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reloadUserData = async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        const decodedToken = decodeJwtToken(userToken);
        const userId = decodedToken.sub;
        
        const databaseRef = ref(database, 'users');
        const snapshot = await get(databaseRef);
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            if (userData.userId === userId) {
              setUserData(userData);     
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
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const databaseRef = ref(database, 'users');
          const snapshot = await get(databaseRef);
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              if (userData.userId === user.uid) {
                // Set user data or perform any necessary actions
              }
            });
          } else {
            console.log('No data available in the database');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    handleReadData();
  }, []);

  useEffect(() => {
    updateTotalPrice();
  }, [order]);
  const getFoods = async (foodsRef) => {
    try {
      const snapshot = await get(foodsRef);
      if (snapshot.exists()) {
        const foodsData = snapshot.val();
        const foodsArray = [];

        Object.keys(foodsData).forEach(foodId => {
          const food = foodsData[foodId];
          if (selectedButton === 'all' || (selectedButton === 'available' && food.availability === true)) {
            const formattedFood = {
              id: foodId,
              Rkey:id,
              name: food.name,
              image: food.image,
              availability: food.availability,
              price: food.price.split(','),
              sizes: food.size.split(','),
              likes: food.likes || 0,
            };
            foodsArray.push(formattedFood);
          }
        });
        setFoods(foodsArray);
      } else {
        setFoods([]);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const handleReadData = async () => {
    const db = database;
    try {
      const categoriesRef = ref(db, `Restaurants/${id}/categories`);
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        Object.keys(categoriesData).forEach(categoryId => {
          const category = categoriesData[categoryId];
          if (category.name === name) {
            const foodsRef = ref(db, `Restaurants/${id}/categories/${categoryId}/foods`);
            getFoods(foodsRef);
          }
        });
      } else {
        setFoods([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const increaseQuantity = (foodId, name, size, price) => {
    const key = `${foodId}-${name}-${size}`;
    setOrder(prevOrder => ({
      ...prevOrder,
      [key]: {
        username:userData.username,
        phone:userData.phoneNumber,
        address:userData.address,
        TableNumber:orderType ||0,
        foodId: foodId,
        Rkey:id,
        name: name,
        size: size,
        price: price,
        quantity: (prevOrder[key]?.quantity || 0) + 1,
        Ckey: Ckey,
      }
    }));
  };

  const decreaseQuantity = (foodId, name, size, price) => {
    const key = `${foodId}-${name}-${size}`;
    setOrder(prevOrder => {
      const updatedOrder = { ...prevOrder };
      if (updatedOrder[key]?.quantity > 0) {
        updatedOrder[key].quantity--;
        if (updatedOrder[key].quantity === 0) {
          delete updatedOrder[key];
        }
      }
      return updatedOrder;
    });
  };

  const updateTotalPrice = () => {
    const price = Object.keys(order).reduce((total, key) => total + (order[key].price * order[key].quantity), 0);
    setTotalPrice(price);
  };

  const handleAddOrder = () => {
    const ordersWithId = Object.keys(order).map(key => ({
      ...order[key]
    }));

    const updatedCartData = [...cartData, ...ordersWithId];
    let totalPrice = 0;
    updatedCartData.forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    setCartData(updatedCartData);
    setTotalPrice(totalPrice);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.item}>
        <TouchableOpacity onPress={() => navigation.navigate('OrderViewScreen', { item: item, Rid: id, Ckey: Ckey, foodkey: item.id,restaurantKey:restaurantKey,userData:userData ,orderType:orderType})}>
          <Image source={{ uri: item.image }} style={styles.image} />
        </TouchableOpacity>
        <View style={styles.quantityContainer}>
          <Text style={styles.name}>{item.name}</Text>
          {item.sizes && item.price ? (
            item.sizes.map((size, index) => (
              <View key={index} style={styles.sizePriceContainer}>
                <Text style={{ fontSize: 10, marginTop: 5 }}>{size}</Text>
                <Text style={{ fontSize: 10, marginTop: 5 }}>{item.price[index]} Rs</Text>
                <View style={styles.quantityButtons}>
                  <TouchableOpacity style={styles.quantityButton} onPress={() => decreaseQuantity(item.id, item.name, size, item.price[index])}>
                    <Text>-</Text>
                  </TouchableOpacity>
                  <Text>{order[`${item.id}-${item.name}-${size}`]?.quantity || 0}</Text>
                  <TouchableOpacity style={styles.quantityButton} onPress={() => increaseQuantity(item.id, item.name, size, item.price[index])}>
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text>No size or price data available</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../images/background.jpg')}
        style={styles.background}
      >
        <Text style={styles.foodType}>{name}</Text>
        <FlatList
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
          data={foods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
        />
        <View style={styles.totalContainer}>
          <Text style={styles.totalPrice}>Total Price: {totalPrice.toFixed(2)} Rs</Text>
          <TouchableOpacity
            style={[styles.addButton, { display: display }]}
            onPress={handleAddOrder}
          >
            <Text style={styles.addButtonText}>AddToCart</Text>
          </TouchableOpacity>
          </View>
          </ImageBackground>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showLoginModal}
            onRequestClose={() => setShowLoginModal(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.loginButton} onPress={() => { navigation.navigate('Profile') }}>
                <Text style={styles.loginButtonText}>Login First</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      );
    }
    
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
      item: {
        flex: 1,
        margin: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'white'
      },
      name: {
        textAlign: 'center',
        color: 'tomato',
        fontSize: 14,
        fontWeight: 'bold',
      },
      image: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
      },
      quantityContainer: {
        padding: 10,
      },
      quantityButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 5
      },
      quantityButton: {
        backgroundColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
      },
      addButton: {
        backgroundColor: 'tomato',
        borderRadius: 5,
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
      },
      addButtonText: {
        color: '#fff',
        fontSize: 15,
      },
      foodType: {
        color: 'white',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 25,
        marginBottom: 10,
      },
      totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
      },
      totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      flatList: {
        paddingHorizontal: 5,
      },
      flatListContent: {
        justifyContent: 'space-between',
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      loginButton: {
        backgroundColor: 'tomato',
        borderRadius: 5,
        padding: 10,
        marginTop: 20,
      },
      loginButtonText: {
        color: '#fff',
        fontSize: 18,
      },
      sizePriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
      },
    });
    
    export default SubdetailedScreen;
    

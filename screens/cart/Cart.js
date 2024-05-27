import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground, Animated } from 'react-native';
import { useCartData } from '../../DataContex/CartDataContex';
import { database, auth } from '../../Firebase/FirebaseConfig';
import { ref, get, push } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDataa } from '../../DataContex/DataContex';
export default function Cart({ navigation }) {
  const { cartData, setCartData } = useCartData();
  const [previousOrders, setPreviousOrders] = useState([]);
  const [cartItems, setCartItems] = useState(Object.values(cartData));
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState(null);
  const [key, setKey] = useState(null);
  const [userData, setUserData] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const [loading, setLoading] = useState(true);
  const { data, setData } = useDataa();
  useEffect(() => {
    const fetchPreviousOrders = async () => {
      try {
        if (data) {
          
          setIsLoggedIn(true)
          const userId = data.userId
          setKey(userId);
          const userOrdersRef = ref(database, `users/${userId}/orders`);
          get(userOrdersRef).then((snapshot) => {
            if (snapshot.exists()) {
              const ordersData = snapshot.val();
              const ordersArray = Object.values(ordersData);
              setPreviousOrders(ordersArray);
            } else {
              console.log("No orders found for the current user");
            }
          }).catch((error) => {
            console.error("Error fetching user orders:", error);
          });
        } else {
          console.log("No user token available");
        }
      } catch (error) {
        console.error("Error fetching previous orders:", error);
      }
    };
  
    fetchPreviousOrders();
  }, [selectedTab]);
  

  const handlePlaceOrder = () => {
    if (cartItems.length === 0 || !isLoggedIn) {
      navigation.navigate('Home'); // Navigate to the Profile stack
      return;
    }
    else if(data.length===0){
      navigation.navigate('ProfileStack'); // Navigate to the Profile stack

    }
  
  
    const newOrder = {
      foods: [...cartItems],
      totalPrice: calculateTotalPrice(),
      timestamp: new Date().toISOString(),
      orderStatus:false,
      key: key // Assuming key is available
    };
    const ordersRef = ref(database, `Restaurants/${cartData[0].Rkey}/orders`);

    push(ordersRef, newOrder)
      .then(() => {
        alert('Order added successfully');
        setCartData([])
      })
      .catch((error) => {
        console.error('Error adding order to Restaurants collection:', error);
      });
    if (key) {
      const userOrdersRef = ref(database, `users/${key}/orders`);
      push(userOrdersRef, newOrder)
        .then(() => {
          console.log('Order added successfully to user collection');
        })
        .catch((error) => {
          console.error('Error adding order to user collection:', error);
        });
    } else {
      console.warn('User key not found, unable to save order to user collection');
    }
  };
  const calculateTotalPrice = () => {
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });
    return totalPrice;
  };

  useEffect(() => {
    setCartItems(Object.values(cartData));
  }, [cartData]);
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  const handleRemoveItem = (index) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems.splice(index, 1);
    setCartItems(updatedCartItems);
  
  };

  

  return (
    <View style={styles.container}>
    <ImageBackground
    source={require('../../images/background.jpg')} // Path to your image file
    style={styles.background}
  >
      <View><Text style={styles.title}>Cart</Text></View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, selectedTab === 1 && styles.selectedButton]}
          onPress={() => setSelectedTab(1)}
        >
          <Text style={styles.buttonText}>Previous Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedTab === 0 && styles.selectedButton]}
          onPress={() => setSelectedTab(0)}
        >
          <Text style={styles.buttonText}>New Order</Text>
        </TouchableOpacity>
      </View>
      {selectedTab === 0 && (
        <>
        <FlatList
  data={cartItems}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item, index }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.itemText}>
          <Ionicons name="fast-food-outline" size={20} color="black" />
          {' Name: '}
          {item.name}
        </Text>
        <Text style={styles.itemText}>
          <Ionicons name="resize-outline" size={20} color="black" />
          {' Size: '}
          {item.size}
        </Text>
      </View>
      <View>
        <Text style={styles.itemText}>
          <Ionicons name="receipt-outline" size={20} color="black" />
          {' Quantity: '}
          {item.quantity}
        </Text>
        <Text style={styles.itemText}>
          <Ionicons name="pricetag-outline" size={20} color="black" />
          {' Price: '}
          {item.price} Rs Each
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(index)}>
        <Ionicons name="close-circle-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  )}
/>

      
      

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: {calculateTotalPrice()} Rs</Text>
            <TouchableOpacity style={styles.orderNowButton} onPress={() => handlePlaceOrder()}>
              <Text style={styles.orderNowButtonText}>Order Now</Text>
              <Ionicons name="ios-cart" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
      {selectedTab === 1 && (
        <FlatList
          data={previousOrders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Order', { item: item ,CUid:key })} style={styles.itemContainer}>
              <View style={styles.previousOrderContainer}>
                <Text style={styles.orderText}>
                  <Ionicons name="cash-outline" size={20} color="black" />
                  {' Total Price: '}
                  <Text style={styles.orderValue}>{item.totalPrice} Rs</Text>
                </Text>
                <Text style={styles.orderText}>
                   <Ionicons name="calendar-outline" size={20} color="black" />
                   <Text style={styles.orderValue}>{formatTimestamp(item.timestamp)}</Text>
                 </Text>

                {item.foods.map((food, index) => (
                  <View key={index} style={styles.foodContainer}>
                    <Text style={styles.itemText}>
                      <Ionicons name="fast-food-outline" size={20} color="black" />
                      {' '}{food.name}
                    </Text>
                    <Text style={styles.itemText}>
                      <Ionicons name="pricetag-outline" size={20} color="black" />
                      {' '}{food.price} Rs
                    </Text>
                    <View style={styles.quantitySizeContainer}>
                      <Text style={styles.itemText}>
                        <Ionicons name="receipt-outline" size={20} color="black" />
                        {' '}{food.quantity}
                      </Text>
                      <Text style={styles.itemText}>
                        <Ionicons name="resize-outline" size={20} color="black" />
                        {' '}{food.size}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      </ImageBackground>
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
    paddingHorizontal:10,
    paddingVertical:20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'white',
    textAlign:'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: 'gray',
    width: '50%',
  },
  selectedButton: {
    backgroundColor: 'tomato',
  },
  buttonText: {
    color: 'white',
    fontSize:15,
    fontWeight:'bold'
  },
  item: {
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderBottomColor: '#ccc',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
  },
  totalContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  orderNowButton: {
    backgroundColor: 'tomato',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNowButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 5,
  },
  itemText: {
    fontSize:15,
    color: 'black',
  },
  itemContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  foodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  quantitySizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderText: {
    color: 'black',
    marginBottom: 5,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { useCartData } from '../../DataContex/CartDataContex';
import { ref, onValue } from 'firebase/database';
import { database } from '../../Firebase/FirebaseConfig';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const OrderViewScreen = ({ route }) => {
  const { item, Rid, Ckey, foodkey,orderType,userData } = route.params;
  const { name, likes, image, sizes, price } = item;
  const [comments, setComments] = useState([]);
  const { cartData, setCartData } = useCartData();
  const [order, setOrder] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  const increaseQuantity = (size, price) => {
    const key = `${name}-${size}`;
    setOrder(prevOrder => ({
      ...prevOrder,
      [key]: {
        username:userData.username,
        phone:userData.phoneNumber,
        address:userData.address,
         TableNumber:orderType ||0,
        Rkey: Rid,
        Ckey: Ckey,
        foodId: foodkey,
        name: name,
        size: size,
        price: price,
        quantity: (prevOrder[key]?.quantity || 0) + 1,
      }
    }));
  
    // Update total price
    setTotalPrice(prevTotalPrice => prevTotalPrice + parseFloat(price));
  };
  console.log(orderType)
  const decreaseQuantity = (size, price) => {
    const key = `${name}-${size}`;
    setOrder(prevOrder => {
      const updatedOrder = { ...prevOrder };
      if (updatedOrder[key]?.quantity > 0) {
        updatedOrder[key].quantity--;
  
        // Update total price
        setTotalPrice(prevTotalPrice => prevTotalPrice - parseFloat(price));
  
        if (updatedOrder[key].quantity === 0) {
          delete updatedOrder[key];
        }
      }
      return updatedOrder;
    });
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

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  useEffect(() => {
    const commentsRef = ref(database, `Restaurants/${Rid}/categories/${Ckey}/foods/${foodkey}/comments`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        const commentsArray = Object.keys(commentsData).map(key => ({
          id: key,
          ...commentsData[key]
        }));
        setComments(commentsArray);
      } else {
        setComments([]); // No comments found
      }
    });

    // Clean up function to unsubscribe from the database when component unmounts
    return () => {
      unsubscribe();
    };
  }, [Rid, Ckey, foodkey]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../images/background.jpg')} 
        style={styles.background}>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.content}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.foodItemsContainer}>
            {sizes.map((size, index) => (
              <View key={index} style={styles.foodItem}>
                <Text>{size}</Text>
                <Text>{price[index]}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity style={styles.quantityButton} onPress={() => decreaseQuantity(size, price[index])}>
                    <Text>-</Text>
                  </TouchableOpacity>
                  <Text>{order[`${name}-${size}`] ? order[`${name}-${size}`].quantity : 0}</Text>
                  <TouchableOpacity style={styles.quantityButton} onPress={() => increaseQuantity(size, price[index])}>
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.total}>Total: {totalPrice} Rs</Text>
          <View style={styles.buttonRow}>
            <View style={styles.likesContainer}>
              <Ionicons name="heart" size={24} color="red" />
              <Text style={styles.likesText}>{likes}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
              <Text style={styles.addText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.commentSection}>
            <Text style={styles.commentHeader}>Comments:</Text>
            <View style={styles.commentListContainer}>
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderCommentItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.commentList}
              />
            </View>
          </View>
        </View>
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
    paddingVertical: 20,
  },
  title: {
    fontSize: 30,
    marginTop: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 320,
    borderRadius: 10,
    marginVertical: 5,
  },
  foodItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 5,
  },
  foodItem: {
    margin: 5,
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
  
    backgroundColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 20,
    marginLeft: 5,
  },
  addButton: {
    backgroundColor: 'tomato',
    borderRadius: 5,
    alignItems: 'center',
    padding: 10,
    width: '45%',
  },
  addText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentSection: {
    marginTop: 20,
    width: '100%',
  },
  commentHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentListContainer: {
    width: '100%',
    height:150
  },
  commentItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    lineHeight: 20,
  },
  commentList: {
    flexGrow: 1,
    paddingVertical: 10,
  },
});

export default OrderViewScreen;

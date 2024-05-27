import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert ,ImageBackground} from 'react-native';
import { ref, get, runTransaction, update } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons'; 
import { database } from '../../Firebase/FirebaseConfig';
import { auth } from '../../Firebase/FirebaseConfig';

const OrderScreen = ({ route }) => {
  const { item,CUid,userData } = route.params

  const key = item.foods[0].Rkey;
  const Ckey = item.foods[0].Ckey;
  const foodkey = item.foods[0].foodId;

  const [likedFoods, setLikedFoods] = useState([]);
  const [dislikedFoods, setDislikedFoods] = useState([]);
  const [foodComments, setFoodComments] = useState({});
  const [likedRestaurants, setLikedRestaurants] = useState([]);
  const [dislikedRestaurants, setDislikedRestaurants] = useState([]);
  const [Rname,setRname]=useState('');
  useEffect(() => {
    const currentUser = CUid;
    if (currentUser) {
      const likedFoodsRef = ref(database, `users/${currentUser}/likedFoods`);
      get(likedFoodsRef)
        .then((snapshot) => {
          const likedFoodsData = snapshot.val();
          if (likedFoodsData) {
            setLikedFoods(Object.keys(likedFoodsData));
          }
        })
        .catch((error) => {
          console.error('Error fetching liked foods:', error);
        });

      const dislikedFoodsRef = ref(database, `users/${currentUser}/dislikedFoods`);
      get(dislikedFoodsRef)
        .then((snapshot) => {
          const dislikedFoodsData = snapshot.val();
          if (dislikedFoodsData) {
            setDislikedFoods(Object.keys(dislikedFoodsData));
          }
        })
        .catch((error) => {
          console.error('Error fetching disliked foods:', error);
        });
    }
  }, []);


  //fetch restaurant data 
  useEffect(() => {
    const currentUser = CUid;
    if (currentUser) {
      const likedRestaurantsRef = ref(database, `users/${currentUser}/likedRestaurants`);
      get(likedRestaurantsRef)
        .then((snapshot) => {
          const likedRestaurantsData = snapshot.val();
          if (likedRestaurantsData) {
            setLikedRestaurants(Object.keys(likedRestaurantsData));
          }
        })
        .catch((error) => {
          console.error('Error fetching liked restaurants:', error);
        });
  
      const dislikedRestaurantsRef = ref(database, `users/${currentUser}/dislikedRestaurants`);
      get(dislikedRestaurantsRef)
        .then((snapshot) => {
          const dislikedRestaurantsData = snapshot.val();
          if (dislikedRestaurantsData) {
            setDislikedRestaurants(Object.keys(dislikedRestaurantsData));
          }
        })
        .catch((error) => {
          console.error('Error fetching disliked restaurants:', error);
        });
    }
    const restaurantReff = ref(database, `Restaurants/${key}`);
    get(restaurantReff)
      .then((snapshot) => {
        const restaurantData = snapshot.val();
     
        // Update UI with restaurant name or other details as needed
        // For example:
        setRname(restaurantData.restaurantName)
      })
      .catch((error) => {
        console.error('Error fetching restaurant data:', error);
      });


  }, []);
  
  const handleLikeFood = (foodId,foodName) => {
    const currentUser = CUid;
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please sign in to like foods.');
      return;
    }
  
    const likedFoodsRef = ref(database, `users/${currentUser}/likedFoods/${foodId}`);
    update(likedFoodsRef, { [foodId]: true,restaurantKey:key,foodname:foodName })
      .then(() => {
        console.log('Food liked successfully');
        setLikedFoods(prevLikedFoods => [...prevLikedFoods, foodId]);
  
        const foodRef = ref(database, `Restaurants/${key}/categories/${Ckey}/foods/${foodkey}`);
        runTransaction(foodRef, (food) => {
          if (food) {
            if (!food.likes) {
              food.likes = 1;
            } else {
              food.likes++;
            }
          }
          return food;
        })
        .then(() => {
          console.log('Likes count incremented successfully');
        })
        .catch((error) => {
          console.error('Error incrementing likes count:', error);
        });
      })
      .catch((error) => {
        console.error('Error liking food:', error);
      });
  };

  const handleDislikeFood = (foodId) => {
    const currentUser = CUid;
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please sign in to dislike foods.');
      return;
    }
  
    const dislikedFoodsRef = ref(database, `users/${currentUser}/dislikedFoods/${foodId}`);
    update(dislikedFoodsRef, { [foodId]: true })
      .then(() => {
        console.log('Food disliked successfully');
        setDislikedFoods(prevDislikedFoods => [...prevDislikedFoods, foodId]);
      })
      .catch((error) => {
        console.error('Error disliking food:', error);
      });
  };

  const handleLikeRestaurant = () => {
    const currentUser = CUid;
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please sign in to like restaurants.');
      return;
    }
  
    const restaurantRef = ref(database, `Restaurants/${key}/likes`);
    const userRef = ref(database, `users/${currentUser}/likedRestaurants`);
  
    update(restaurantRef, { [CUid]: true })
      .then(() => {
        console.log('Restaurant liked successfully');
        // Update state immediately
        setLikedRestaurants(prevLikedRestaurants => [...prevLikedRestaurants, key]);
        get(userRef)
          .then((snapshot) => {
            const likedRestaurants = snapshot.val() || {};
            update(userRef, { ...likedRestaurants, [key]: true });
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);
          });
      })
      .catch((error) => {
        console.error('Error liking restaurant:', error);
      });
  };

  const handleDislikeRestaurant = () => {
    const currentUser = CUid;
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please sign in to dislike restaurants.');
      return;
    }
  
    const restaurantRef = ref(database, `Restaurants/${key}/dislikes`);
    const userRef = ref(database, `users/${currentUser}/dislikedRestaurants`);
  
    update(restaurantRef, { [CUid]: true })
      .then(() => {
        console.log('Restaurant disliked successfully');
        // Update state immediately
        setDislikedRestaurants(prevDislikedRestaurants => [...prevDislikedRestaurants, key]);
        get(userRef)
          .then((snapshot) => {
            const dislikedRestaurants = snapshot.val() || {};
            update(userRef, { ...dislikedRestaurants, [key]: true });
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);
          });
      })
      .catch((error) => {
        console.error('Error disliking restaurant:', error);
      });
  };
  

  const handleCommentChange = (foodId, comment) => {
    setFoodComments(prevComments => ({
      ...prevComments,
      [foodId]: comment,
    }));
  };

  const handleSubmitComment = (foodId) => {
    const currentUser = CUid;
    const comment = foodComments[foodId];

    if (currentUser && comment) {
      const userRef = ref(database, `users/${currentUser}/username`);
      get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const username = snapshot.val();
          const commentRef = ref(database, `Restaurants/${key}/categories/${Ckey}/foods/${foodkey}/comments`);
          const commentData = {
            userId: currentUser,
            username: username,
            comment: comment,
          };

          update(commentRef, {
            [Date.now()]: commentData
          })
          .then(() => {
            console.log('Comment submitted successfully');
            setFoodComments(prevComments => ({
              ...prevComments,
              [foodId]: '',
            }));
          })
          .catch((error) => {
            console.error('Error submitting comment:', error);
          });
        } else {
          console.error('Username not found for the current user');
        }
      })
      .catch((error) => {
        console.error('Error fetching username:', error);
      });
    } else {
      console.error('No user logged in or comment is undefined');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <ImageBackground
    source={require('../../images/background.jpg')} // Path to your image file
    style={styles.background}
  >
      <Text style={styles.title}>Order Details</Text>
      
      <View style={styles.orderDetailsContainer}>
      <View style={styles.buttonsContainer}>
      <Text style={{fontSize:20,fontWeight:'bold',color:'tomato'}}>{Rname}</Text>
      <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: dislikedRestaurants.includes(key) ? 'red' : 'gray' }
      ]}
      onPress={() => handleDislikeRestaurant(key)}
      disabled={dislikedRestaurants.includes(key) || likedRestaurants.includes(key)}
    >
      <Text style={styles.buttonText}>
        {dislikedRestaurants.includes(key) ? 'Disliked' : 'Dislike'}
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: likedRestaurants.includes(key) ? 'green' : 'gray' }
      ]}
      onPress={() => handleLikeRestaurant(key)}
      disabled={likedRestaurants.includes(key) || dislikedRestaurants.includes(key)}
    >
      <Text style={styles.buttonText}>
        {likedRestaurants.includes(key) ? 'Liked' : 'Like'}
      </Text>
    </TouchableOpacity>
    
        
      </View>
       
        {item.foods.map((food, index) => (
          <View key={index} style={styles.foodContainer}>
          <Text style={styles.subTitle}>{food.username}</Text>
          <Text style={styles.subTitle}>Ordered Items:</Text>
            <Text style={styles.foodName}>
              <Ionicons name="fast-food-outline" size={20} color="black" /> {food.name}
            </Text>
            <Text style={styles.foodDetails}>
              <Ionicons name="pricetag-outline" size={20} color="black" /> Price: {food.price} Rs
            </Text>
            <Text style={styles.foodDetails}>
              <Ionicons name="logo-buffer" size={20} color="black" /> Quantity: {food.quantity}
            </Text>
            <Text style={styles.foodDetails}>
              <Ionicons name="resize-outline" size={20} color="black" /> Size: {food.size}
            </Text>
            <Text style={styles.totalPrice}>Total Price: {item.totalPrice} Rs</Text>
            <Text style={styles.totalPrice}>Date/Time: {new Date(item.timestamp).toLocaleString()}</Text>

            <View style={{display:'flex',flexDirection:'row',width:'100%'}}>
            <TextInput
              style={styles.commentInput}
              multiline
              placeholder="Enter your comments..."
              value={foodComments[food.foodId] || ''}
              onChangeText={(comment) => handleCommentChange(food.foodId, comment)}
            />
            <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmitComment(food.foodId)}
              >
                <Ionicons name="send" size={20} color="tomato" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonRow}>
            <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: dislikedFoods.includes(food.foodId) ? 'red' : 'gray' }
            ]}
            onPress={() => handleDislikeFood(food.foodId)}
            disabled={likedFoods.includes(food.foodId) || dislikedFoods.includes(food.foodId)}
          >
          
                <Ionicons name="thumbs-down-outline" size={20} color="white" />
                <Text style={styles.buttonText}>
                  {dislikedFoods.includes(food.foodId) ? 'Disliked' : 'Dislike'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: likedFoods.includes(food.foodId) ? 'green' : 'gray' }
              ]}
              onPress={() => handleLikeFood(food.foodId,food.name)}
              disabled={likedFoods.includes(food.foodId) || dislikedFoods.includes(food.foodId)}
            >
            
                <Ionicons name="thumbs-up-outline" size={20} color="white" />
                <Text style={styles.buttonText}>
                  {likedFoods.includes(food.foodId) ? 'Liked' : 'Like'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      
      </View>
     
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  
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
    textAlign: 'center',
    color: 'white',
  },
  orderDetailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#666',
  },
  foodContainer: {
    marginBottom: 20,
  
  },
  foodName: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  foodDetails: {
    color: '#666',
    marginBottom: 3,
  },
  totalPrice: {
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems:'center',
    marginVertical: 5,

  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 10,
    flexDirection: 'row',
    marginTop:10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#fff',
    width:'90%'
  },
  submitButton: {

    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default OrderScreen;

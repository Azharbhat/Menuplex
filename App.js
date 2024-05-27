import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ImageBackground, StyleSheet } from 'react-native';

import HomeScreen from "./screens/HomeFolder/HomeScreen";
import DetailedScreen from './screens/HomeFolder/DetailedScreen';
import SubdetailedScreen from './screens/HomeFolder/SubdetailedScreen';
import OrderViewScreen from './screens/HomeFolder/OrderViewScreen';
import OrderScreen from './screens/cart/OrderScreen';
import Cart from './screens/cart/Cart';
import Liked from './screens/liked/Liked';
import Profile from './screens/profile/Profile';
import Scanner from './screens/scanner/Scanner';
import Login from './screens/profile/Login';
import Register from './screens/profile/Register';
import UpdateDetails from './screens/profile/UpdateDetails';
import CartIcon from './CartIcon';
import { Ionicons } from '@expo/vector-icons';
import { DataProvider } from './DataContex/DataContex'; 
import { CartDataContext, CartDataProvider, useCartData } from './DataContex/CartDataContex'; 
import { auth } from './Firebase/FirebaseConfig'; 
// Import CartIcon component

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ProfileStack component
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
    <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// CartStack component
const CartStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />
    <Stack.Screen name="Order" component={OrderScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Detailed" component={DetailedScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Subdetailed" component={SubdetailedScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OrderViewScreen" component={OrderViewScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  return (
    <DataProvider>
      <CartDataProvider>
        <NavigationContainer>
          <ImageBackground
            source={require('./images/background.jpg')} // Path to your image file
            style={styles.background}
          >
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconComponent;
                  let iconColor = color; // Default color
              
                  if (route.name === 'HomeStack') {
                    iconComponent = focused ? 'home' : 'home-outline';
                  } else if (route.name === 'CartStack') {
                    if (focused) {
                      iconComponent = 'cart';
                    } else {
                      iconComponent = <CartIcon />;
                      
                    }
                    
                    // Check if the cart is clicked and there are items in it
                    if (focused && useCartData().cartData.length > 0) {
                      iconColor = 'yellow'; // Set color to yellow
                    }
                  } else if (route.name === 'Liked') {
                    iconComponent = focused ? 'heart' : 'heart-outline';
                  } else if (route.name === 'Scanner') {
                    iconComponent = focused ? 'scan' : 'scan-outline';
                  } else if (route.name === 'ProfileStack') {
                    iconComponent = focused ? 'person' : 'person-outline';
                  }
              
                  return typeof iconComponent === 'string' ? (
                    <Ionicons name={iconComponent} size={size} color={iconColor} />
                  ) : (
                    iconComponent
                  );
                }
              })}
              
                tabBarOptions={{
                  activeTintColor: 'tomato',
                  inactiveTintColor: 'gray',
                  style: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                  },
                }}
              >
                <Tab.Screen name="HomeStack" component={HomeStack} options={{ headerShown: false }} />
                <Tab.Screen name="Liked" component={Liked} options={{ headerShown: false }} />
                <Tab.Screen name="Scanner" component={Scanner} options={{ headerShown: false }} />
                <Tab.Screen name="CartStack" component={CartStack} options={{ headerShown: false }} />
                <Tab.Screen name="ProfileStack" component={ProfileStack} options={{ headerShown: false }} />
              </Tab.Navigator>
            </GestureHandlerRootView>
          </ImageBackground>
        </NavigationContainer>
      </CartDataProvider>
    </DataProvider>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});

export default App;

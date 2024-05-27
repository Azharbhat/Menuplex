import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native'; // Import Text from react-native
import { useCartData } from './DataContex/CartDataContex';

const CartIcon = () => {
  const { cartData } = useCartData();
  const cartCount = cartData.length;
      cartCount>0?cartCount:null;

  const iconName = cartCount > 0 ? 'cart' : 'cart-outline'; // Set iconName based on cartData length

  return (
    <>
    {cartCount > 0 && <Text style={{textAlign:'right',color:'tomato'}}>{cartCount}</Text>}
      <Ionicons name={iconName} size={24} color={cartCount > 0 ? 'yellow' : 'gray'} />
    </>
  );
};

export default CartIcon;

import React, { createContext, useContext, useState } from 'react';
const CartDataContext = createContext();
export const CartDataProvider = ({ children }) => {
  const [cartData, setCartData] = useState([]);
  return (
    <CartDataContext.Provider value={{ cartData, setCartData }}>
      {children}
    </CartDataContext.Provider>
  );
};
export const useCartData = () => useContext(CartDataContext);

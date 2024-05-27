import React, { createContext, useState, useEffect } from 'react';
import { database } from './firebase'; // Update the path to your firebase configuration file

// Create the DataContext
const DataContext = createContext();

// Create a provider for components to consume and set initial state
export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);

  // Fetch data from Firebase database
  const fetchDataFromDatabase = () => {
    const dataRef = database.ref('users'); // Update this path to your actual data node

    dataRef.on('value', (snapshot) => {
      const fetchedData = snapshot.val();
      if (fetchedData) {
        setData(fetchedData);
      }
    }, (error) => {
      console.error('Error fetching data from Firebase:', error);
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDataFromDatabase();

    // Clean up the listener on component unmount
    return () => {
      const dataRef = database.ref('users'); // Update this path to your actual data node
      dataRef.off(); // Remove the listener
    };
  }, []);

  return (
    <DataContext.Provider value={{ data }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;

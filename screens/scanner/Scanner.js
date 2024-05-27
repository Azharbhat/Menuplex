import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { ref, get } from 'firebase/database';
import { database } from '../../Firebase/FirebaseConfig';
import { FontAwesome } from '@expo/vector-icons';


const ScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [key, setKey] = useState(null);
  const [resetScan, setResetScan] = useState(false); // State to reset scanned data

  useEffect(() => {
    (async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permission:', error);
      }
    })();
  }, []);

  const handleReadData = async (key) => {
    try {
      const restaurantRef = ref(database, `Restaurants/${key}`);
      const snapshot = await get(restaurantRef);

      if (snapshot.exists()) {
        const restaurantData = snapshot.val();
        setRestaurantInfo(restaurantData);
      } else {
        console.log("Restaurant data not found for key: ", key);
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    setScannedData(data);
    const extractedKey = data.split('Key:')[1].trim();
    const name = data.split('Restaurant:')[1].split('\n')[0].trim();
    const tableNumber = data.match(/Table:\s*(\d+)/)?.[1];
   // console.log(data)
  
    navigation.navigate('Detailed', { name: name, key: extractedKey,orderType:tableNumber });
  
    handleReadData(extractedKey);
    setKey(extractedKey);
  
    // Reset scannedData state immediately
    setScannedData(null);
  };
  

  useEffect(() => {
    if (resetScan) {
      setScannedData(null);
    }
  }, [resetScan]);

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 50, padding: 20, textAlign: 'center', color: 'white' }}>Let'sEat</Text>
      </View>

      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scannedData ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {scannedData && restaurantInfo && (
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigation.navigate('Detailed', { id: restaurantInfo.id, name: restaurantInfo.restaurantName, key: key });
            setRestaurantInfo(null);
            setScannedData(null); // Reset scannedData state
          }}
        >    
        </TouchableOpacity>
      )}

      <Text style={{ fontSize: 30, padding: 5, color: 'tomato' }}>Table Order</Text>
      <Text style={{ fontSize: 20, padding: 5 }}>Scan QR code</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  dataContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  scannerContainer: {
    width: 300,
    height: '70%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  header: {
    backgroundColor: 'tomato',
    width: '100%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  item: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
  },


  itemLeft: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  itemRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ScannerScreen;

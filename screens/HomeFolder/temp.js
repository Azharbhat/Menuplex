<Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 4 }}>
Distance: {item.distance ? item.distance.toFixed(2) : 'N/A'} km
</Text>

const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log('User location:', location.coords);

      // Calculate distance between user location and each restaurant
      const restaurantsWithDistance = userData.map(restaurant => {
        const distance = calculateDistance(location.coords.latitude, location.coords.longitude, restaurant.geoLocation.coords.latitude, restaurant.geoLocation.coords.longitude);
        return { ...restaurant, distance };
      });

      console.log('Restaurants with distance:', restaurantsWithDistance);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    // Convert distance to meters if less than 1 km
    return distance < 1 ? distance * 1000 : distance;
  };
import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid, PermissionsAndroid } from 'react-native'
import GeoLocation from 'react-native-geolocation-service'
import AsyncStorage from '@react-native-community/async-storage'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app requires access to your location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can access location');
      return true;
    } else {
      console.log('Location permission denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
  }
}

class Map extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      location: null,
      latitude: null,
      longitude: null,
      locationPermission: false
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()
      this.getCurrentLocation()
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  checkLoggedIn = async () => {
    const token = await AsyncStorage.getItem('@session_token')
    if (token == null) {
      this.props.navigation.navigate('Login')
    }
  }

  getCurrentLocation = () => {

    if(!this.state.locationPermission)
        this.state.locationPermission = requestLocationPermission()

    GeoLocation.getCurrentPosition(
      (position) => {
        const location = JSON.stringify(position)
        const coords = JSON.parse(location)

        this.setState({ location, isLoading: false, latitude: coords.coords.latitude, longitude: coords.coords.longitude })
      },
      (error) => {
        ToastAndroid.show(error, ToastAndroid.SHORT);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    )
  }

  render () {

    if (this.state.isLoading) {
      return (
        <View>
          <Text>Map View</Text>
          <Text>Loading...</Text>
        </View>
      )
    } else {
      return (
        <View style={StyleSheet.absoluteFillObject}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002
            }}
          />
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 100,
    left: 50
  },
});

export default Map

import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid, PermissionsAndroid } from 'react-native'
import GeoLocation from 'react-native-geolocation-service'
import AsyncStorage from '@react-native-community/async-storage'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

class Map extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      latitude: null,
      longitude: null
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()
      this.setCurrentLocation()
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

  setCurrentLocation = async() => {
    this.setState({
      latitude: await AsyncStorage.getItem('@latitude'),
      longitude: await AsyncStorage.getItem('@longitude'),
      isLoading: false
    })
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
        <View style={styles.container}>
          <View style={styles.container}>
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
          <View style={styles.info}>
            <Text>Details</Text>
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  info: {
    flex: 0.3
  },
  map: {
    position: 'absolute',
    top: 100,
    left: 50
  },
});

export default Map

import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid, PermissionsAndroid } from 'react-native'
import GeoLocation from 'react-native-geolocation-service'
import AsyncStorage from '@react-native-community/async-storage'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

import Loading from '../Loading/Loading'

import iconMarker from '../../resources/img/marker_sm.png'
import iconMarkerLocation from '../../resources/img/marker_sm_blue.png'

class Map extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      latitude: null,
      longitude: null,
      mapData: []
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()
      this.setCurrentLocation()
      this.getData()
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
      latitude: parseFloat(await AsyncStorage.getItem('@latitude')),
      longitude: parseFloat(await AsyncStorage.getItem('@longitude'))
    })
  }

  getData = async () => {

    return fetch("http://10.0.2.2:3333/api/1.0.0/find", {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('@session_token')
      }
    })
    .then((response) => {
      if(response.status === 200){
        return response.json()
      } else if (response.status === 401) {
        ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT);
        this.props.navigation.navigate('Login')
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then((responseJson) => {
      this.setState({
        isLoading: false,
        mapData: responseJson
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  render () {

    if (this.state.isLoading) {
      return (
        <Loading />
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
                latitudeDelta: 0.012,
                longitudeDelta: 0.012
              }}
            >
              {this.state.mapData.map(marker => (
                <MapView.Marker 
                  icon={iconMarker}
                  key={marker.location_id}
                  coordinate={{latitude: marker.latitude,
                  longitude: marker.longitude}}
                  title={marker.location_name}
                  description={marker.location_town}
                />
              ))}
              <Marker
                icon={iconMarkerLocation}
                coordinate={{latitude: this.state.latitude,
                longitude: this.state.longitude}}
                title={"Location"}
                description={"Current Location"}
              />
            </MapView>
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFA5AD'
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

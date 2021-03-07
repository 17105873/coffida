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
      currentLocation: null,
      mapData: [],
      locationDetail: null
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
      longitude: parseFloat(await AsyncStorage.getItem('@longitude')),
      currentLocation: {
        longitude: parseFloat(await AsyncStorage.getItem('@longitude')),
        latitude: parseFloat(await AsyncStorage.getItem('@latitude'))
      }
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

  //function to retrieve distance between 2 points (as the crow flies)
  distance(lat, lon) {

    if (this.state.latitude == null){
      return 0
    }

    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat - this.state.latitude) * p)/2 + 
            c(this.state.latitude * p) * c(lat * p) * 
            (1 - c((lon - this.state.longitude) * p))/2;
  
    return (12742 * Math.asin(Math.sqrt(a))).toFixed(2) // 2 * R; R = 6371 Radius of earth in km
  }

  loadLocation() {

    if (this.state.locationDetail !== null)
    {
      return (
        <View style={styles.locationDetails}>
          <View style={styles.locHeader}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('Details', {
                    locationId: this.state.locationDetail.location_id
                  });
                }}
              >
                <View>
                  <View style={styles.mainDetails}>
                    <Text style={styles.locationName}>{this.state.locationDetail.location_name}</Text>
                    <Text style={styles.locationDistance}>{this.distance(this.state.locationDetail.latitude, this.state.locationDetail.longitude)} km</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationTown}>{this.state.locationDetail.location_town}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )
    }
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
                latitude: this.state.currentLocation.latitude, 
                longitude: this.state.currentLocation.longitude, 
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
                  onPress={() => {
                    this.setState({
                      locationDetail: marker,
                      currentLocation: {
                        longitude: marker.longitude,
                        latitude: marker.latitude
                      }
                    })
                  }}
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
          {this.loadLocation()}
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 4,
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
  locHeader: {
    flex: 1.5,
    padding: 10
  },
  locationDetails: {
    flex: 1,
    backgroundColor: '#FFA5AD'
  },
  itemContainer: {
    padding: 10,
    flexDirection: 'column'
  },
  mainDetails: {
    flexDirection: 'row'
  },
  locationName: {
    fontSize: 30,
    color: 'red',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
    flex: 3
  },
  locationDistance: {
    color: 'red',
    flex: 1,
    paddingTop: 10,
    fontFamily: 'Courier New',
    fontWeight: 'bold',
    fontSize: 20
  },
  locationTown: {
    color: 'black',
    paddingTop: 5,
    fontFamily: 'Courier New Bold',
    fontSize: 25
  },
  selectMarker: {
    color: 'black',
    paddingTop: 5,
    fontWeight: 'bold',
    fontFamily: 'Courier New Bold',
    fontSize: 25,
    padding: 20
  }
});

export default Map

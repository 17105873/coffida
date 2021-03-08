import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

import Loading from '../Loading/Loading'
import Helper from '../Helpers/Helper'

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

    // CurrentLocation Used For Map Marker and Positioning
    // Lat & Long Used to calculate distance From Current Location 
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
    Helper.getLocations().then((responseJson) => {
      if (responseJson == 'Login'){
        ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT)
        this.props.navigation.navigate('Login')
        return
      } else if (responseJson == 'Error') {
        ToastAndroid.show("There Was An Error. Please Try Again", ToastAndroid.SHORT)
        return
      } else {
        this.setState({
          isLoading: false,
          mapData: responseJson
        })
      }
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
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
                    <Text style={[GlobalStyles.locationName, styles.locationName]}>{this.state.locationDetail.location_name}</Text>
                    <Text style={[GlobalStyles.locationDistance, styles.locationDistance]}>{Helper.calculateDistance(this.state.latitude, this.state.longitude, this.state.locationDetail.latitude, this.state.locationDetail.longitude)} km</Text>
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
  },
  locationDistance: {
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

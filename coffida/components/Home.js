import 'react-native-gesture-handler'

import React, { Component } from 'react'
import { Text, View, StyleSheet, ImageBackground, ScrollView, ToastAndroid, PermissionsAndroid, FlatList, TouchableOpacity } from 'react-native'
import GeoLocation from 'react-native-geolocation-service'
import AsyncStorage from '@react-native-community/async-storage'

import Loading from './Loading/Loading'
import Helper from './Helpers/Helper'
import GlobalStyles from './Helpers/style'

import backgroundImg from '../resources/img/home_bg2.png'

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

class Home extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      forename: '',
      surname: '',
      latitude: null,
      longitude: null,
      userData: null,
      locationPermission: false
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()

      this.getUserDetails()

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

  getUserDetails = async () => {

    Helper.getUserDetails().then((responseJson) => {
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
          userData: Helper.sortList(responseJson.favourite_locations, "avg_overall_rating"),
          forename: responseJson.first_name,
          surname: responseJson.last_name
        })
      }
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  getCurrentLocation(){

    if(!this.state.locationPermission)
        this.state.locationPermission = requestLocationPermission()

    GeoLocation.getCurrentPosition(
      async(position) => {
        const location = JSON.stringify(position)
        const coords = JSON.parse(location)

        await AsyncStorage.setItem('@latitude', coords.coords.latitude.toString());
        await AsyncStorage.setItem('@longitude', coords.coords.longitude.toString());

        this.setState({
          latitude: coords.coords.latitude.toString(),
          longitude: coords.coords.longitude.toString()
        })
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

  showFavourites() {

    if (this.state.userData !== null && this.state.userData.length > 0) {
      return (
        <FlatList 
          data={this.state.userData}
          renderItem={({item}) => (
            <View>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('Details', {
                    locationId: item.location_id
                  });
                }}
              >
                <View style={styles.itemContainer}>
                  <View style={styles.mainDetails}>
                    <Text style={GlobalStyles.locationName}>{item.location_name}</Text>
                    <Text style={GlobalStyles.locationDistance}>{Helper.calculateDistance(this.state.latitude, this.state.longitude, item.latitude, item.longitude)} km</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={GlobalStyles.locationTown}>{item.location_town}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item,index) => item.location_id.toString()}
        />
      )
    } else {
      return (
        <View>
          <Text style={styles.noFavLocations}>You currently don't have any favourite locations</Text>
        </View>
      )
    }
  }


  render () {
    if (this.state.isLoading == true)
    {
      return (
        <Loading />
      )
    } else {
      return (
        <View style={GlobalStyles.scrollContainer}>
          <ImageBackground source={backgroundImg} style={styles.image}>
            <View style={styles.headerView}>
              <Text style={styles.header}>Welcome</Text>
              <Text style={styles.header}>{this.state.forename + ' ' + this.state.surname}</Text>
            </View>
          </ImageBackground>
          <View style={styles.favHeader}>
            <Text style={styles.favLocations}>Your Favourite Locations</Text>
            {this.showFavourites()}
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    height: 250
  },
  headerView: {
    backgroundColor:'rgba(0,0,0,0.75)',
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1
  },
  header: {
    color: 'white',
    fontSize: 50,
    textAlign: 'center',
    opacity: 1
  },
  favHeader: {
    flex: 1.5,
    padding: 10
  },
  favLocations: {
    fontWeight: 'bold',
    fontSize: 25,
    color: 'red',
    paddingLeft: 10
  },
  noFavLocations: {
    fontSize: 20,
    color: 'white'
  },
  itemContainer: {
    padding: 10,
    borderColor: 'red',
    borderBottomWidth: 2,
    flexDirection: 'column'
  },
  mainDetails: {
    flexDirection: 'row'
  },
  locationContainer: {
    flex: 1
  }
})

export default Home

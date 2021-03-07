import 'react-native-gesture-handler'

import React, { Component } from 'react'
import { Text, View, StyleSheet, ImageBackground, ScrollView, ToastAndroid, PermissionsAndroid, FlatList, TouchableOpacity } from 'react-native'
import GeoLocation from 'react-native-geolocation-service'
import AsyncStorage from '@react-native-community/async-storage'

import Loading from './Loading/Loading'

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
      lat: null,
      lng: null,
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

    const token = await AsyncStorage.getItem('@session_token')
    const userId = await AsyncStorage.getItem('@user_id')

    return fetch('http://10.0.2.2:3333/api/1.0.0/user/' + userId, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token
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
        userData: this.sortList(responseJson.favourite_locations, "avg_overall_rating"),
        forename: responseJson.first_name,
        surname: responseJson.last_name
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })

  }

  sortList(responseJson, sortBy) {
    var data = responseJson
    data = data.sort(this.sortBy(sortBy))
    return data
  }

  sortBy(prop){
    return function(a,b){
       if (a[prop] < b[prop]){
          return 1;
       } else if(a[prop] > b[prop]){
          return -1;
       }
       return 0;
    }
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
          lat: coords.coords.latitude.toString(),
          lng: coords.coords.longitude.toString()
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

  //function to retrieve distance between 2 points (as the crow flies)
  distance(lat, lon) {

    if (this.state.lat == null){
      return 0
    }

    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat - this.state.lat) * p)/2 + 
            c(this.state.lat * p) * c(lat * p) * 
            (1 - c((lon - this.state.lng) * p))/2;
  
    return (12742 * Math.asin(Math.sqrt(a))).toFixed(2) // 2 * R; R = 6371 Radius of earth in km
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
                    <Text style={styles.locationName}>{item.location_name}</Text>
                    <Text style={styles.locationDistance}>{this.distance(item.latitude, item.longitude)} km</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationTown}>{item.location_town}</Text>
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
        <View style={styles.scrollContainer}>
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
  scrollContainer: {
    backgroundColor: '#FFA5AD',
    flexDirection: 'column',
    flex: 1
  },
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
  },
  locationName: {
    fontSize: 20,
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
    fontWeight: 'bold'
  },
  locationTown: {
    color: 'black',
    flex: 1,
    paddingTop: 5,
    fontFamily: 'Courier New Bold'
  }
})

export default Home

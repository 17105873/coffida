import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid, StyleSheet, Image } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {Picker} from '@react-native-picker/picker'

let currentLat
let currentLng

class ListView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      sortBy: 'avg_overall_rating',
      listData: []
    }

  }
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()

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

    currentLat = await AsyncStorage.getItem('@latitude')
    currentLng = await AsyncStorage.getItem('@longitude')
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
      //Sorting Data By Average Highest Overall Review
      this.setState({
        isLoading: false,
        listData: this.sortList(responseJson, this.state.sortBy)
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
       if (a[prop] > b[prop]){
          return 1;
       } else if(a[prop] < b[prop]){
          return -1;
       }
       return 0;
    }
  }

  activeSort(sortBy) {

    if (sortBy !== 'distance') {
      this.setState({ listData: this.state.listData.sort(this.sortBy(sortBy)), sortBy: sortBy })
    } else {
      //
    }
  }

  //function to retrieve distance between 2 points (as the crow flies)
  distance(lat, lon) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat - currentLat) * p)/2 + 
            c(currentLat * p) * c(lat * p) * 
            (1 - c((lon - currentLng) * p))/2;
  
    return (12742 * Math.asin(Math.sqrt(a))).toFixed(2) // 2 * R; R = 6371 Radius of earth in km
  }

  render () {

    if (this.state.isLoading == true)
    {
      return (
        <View style={styles.scrollContainer}>
          <Text style={styles.header}>Locations</Text>
        </View>
      )
    } else {
      return (
        <View style={styles.scrollContainer}>
          <View>
            <Text style={styles.header}>Locations</Text>
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort By:</Text>
              <Picker
                selectedValue={this.state.sortBy}
                style={{ height: 50, width: 150, color: 'white', fontWeight: 'bold' }}
                onValueChange={(itemValue) => this.activeSort(itemValue)}
              >
                <Picker.Item label="Rating" value="avg_overall_rating" />
                <Picker.Item label="Price" value="avg_price_rating" />
                <Picker.Item label="Distance" value="distance" />
              </Picker>
            </View>
            <FlatList 
              data={this.state.listData}
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
                      <Text style={styles.locationName}>{item.location_name}</Text>
                      <Text style={styles.locationDistance}>{this.distance(item.latitude, item.longitude)} km</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item,index) => item.location_id.toString()}
            />
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
  itemContainer: {
    padding: 10,
    borderColor: 'red',
    borderBottomWidth: 2,
    flexDirection: 'row'
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
  label: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 35,
    marginHorizontal: 10
  },
  headerView: {
    backgroundColor:'rgba(0,0,0,0.75)',
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1
  },
  header: {
    color: 'red',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  recent: {
    flex: 1
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  sortLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    padding: 10
  }
})

export default ListView

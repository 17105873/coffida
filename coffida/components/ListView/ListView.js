import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid, StyleSheet, Image } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {Picker} from '@react-native-picker/picker'

import Loading from '../Loading/Loading'
import Helper from '../Helpers/Helper'
import GlobalStyles from '../Helpers/style'

class ListView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      latitude: null,
      longitude: null,
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
      //Sorting Data By Average Highest Overall Review
      this.setState({
        isLoading: false,
        listData: Helper.sortList(responseJson, this.state.sortBy)
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  activeSort(sortBy) {

    if (sortBy !== 'distance') {
      this.setState({ listData: this.state.listData.sort(this.sortBy(sortBy)), sortBy: sortBy })
    } else {
      // TO DO
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
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
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
  label: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 35,
    marginHorizontal: 10
  },
  header: {
    color: 'white',
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

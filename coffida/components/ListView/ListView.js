import React, { Component } from 'react'
import { Text, View, FlatList, TouchableOpacity, ToastAndroid, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {Picker} from '@react-native-picker/picker'

import Loading from '../Helpers/Loading'
import Helper from '../Helpers/Helper'
import GlobalStyles from '../Helpers/Style'

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
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
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

  // Get All Locations
  getData = async () => {

    Helper.getLocations().then((responseJson) => {
      if (responseJson == 'Login') {
        ToastAndroid.show('You\'re not Logged In', ToastAndroid.SHORT)
        this.props.navigation.navigate('Login')
        return
      } else if (responseJson == 'Error') {
        ToastAndroid.show('There Was An Error. Please Try Again', ToastAndroid.SHORT)
        return
      } else {
        this.setState({
          isLoading: false,
          listData: Helper.sortList(responseJson, this.state.sortBy)
        })
      }
    })
    .catch((error) => {
      console.log(error)
      ToastAndroid.show(error, ToastAndroid.SHORT)
    })

  }

  activeSort(sortBy) {
    this.setState({ listData: this.state.listData.sort(Helper.sortBy(sortBy)), sortBy: sortBy })
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
                style={styles.pickerStyle}
                onValueChange={(itemValue) => this.activeSort(itemValue)}
              >
                <Picker.Item label='Overall Rating' value='avg_overall_rating' />
                <Picker.Item label='Best Price' value='avg_price_rating' />
                <Picker.Item label='Best Quality' value='avg_quality_rating' />
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
                      })
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
  },
  pickerStyle: {
    height: 50,
    width: 150,
    color: 'white',
    fontWeight: 'bold'
  }
})

export default ListView

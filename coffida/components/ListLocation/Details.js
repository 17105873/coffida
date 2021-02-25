import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

class Details extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      favLocation: false,
      details: []
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()

      this.getDetails()
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

  getDetails = async () => {

    const locationId = this.props.route.params.locationId

    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + locationId, {
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
        details: responseJson
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  favouriteLocation = async ({favLoc}) => {
    
    const locationId = this.props.route.params.locationId
    var action

    if (favLoc) {
      action = 'post'
    } else {
      action = 'delete'
    }

    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + locationId + "/favourite", {
      method: action,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('@session_token')
      },
      body: {
        'loc_id': locationId
      }
    })
    .then((response) => {
      if(response.status === 200){
        return
      } else if (response.status === 401) {
        ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT);
        this.props.navigation.navigate('Login')
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then(() => {
      this.setState({
        favLocation: favLoc ? true : false
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  render () {

    let favLocText
    let favLoc

    if(this.state.favLocation == true) {
      favLocText = 'Unfavourite Location'
      favLoc = false;
    } else {
      favLocText = 'Favourite Location'
      favLoc = true;
    }

    if(this.state.isLoading == true) {
      return (
        <View>
          <Text>Details</Text>
        </View>
      )
    } else {
      return (
        <View>
          <Text>Details</Text>
          <View>
            <Text>{this.state.details.location_name}</Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => this.favouriteLocation({favLoc})}>
              <Text>{favLocText}</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text>Write Review</Text>
          </View>
        </View>
      )
    }
  }
}

export default Details

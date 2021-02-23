import 'react-native-gesture-handler'

import React, { Component } from 'react'
import { Text, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';

import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Tab = createBottomTabNavigator()

class Home extends Component {
  constructor (props) {
    super(props)
  }

  checkLoggedIn = async () => {
    const token = await AsyncStorage.getItem('@session_token')
    if (token == null) {
      this.props.navigation.navigate('Login')
    }
  }

  render () {

    return (
      <View>
        <Text>Home</Text>
      </View>
    )
  }
}

export default Home

import 'react-native-gesture-handler'

import React, { Component } from 'react'
import { Text, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';

import Home from './Home'
import MapView from './location/MapView'
import ListView from './location/ListView'
import User from './User'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator();

class HomeIndex extends Component {
  constructor (props) {
    super(props)
  }
/*
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn();
    }) 
  }

  componentWillUnmount() {
    this.unsubscribe()
  }
*/
  checkLoggedIn = async () => {
    const token = await AsyncStorage.getItem('@session_token')
    if (token == null) {
      this.props.navigation.navigate('Login')
    }
  }

  render () {
    return (
      <NavigationContainer independent>
        <Tab.Navigator>
          <Tab.Screen name='Map View' component={MapView} />
          <Tab.Screen name='List View' component={ListView} />
          <Tab.Screen name='Home' component={Home} />
          <Tab.Screen name='User Details' component={User} />
        </Tab.Navigator>
      </NavigationContainer>
    )
  }
}

export default HomeIndex

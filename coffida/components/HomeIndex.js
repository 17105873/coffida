import 'react-native-gesture-handler'

import React, { Component } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import AsyncStorage from '@react-native-community/async-storage'

import Home from './Home'
import MapView from './location/MapView'
import ListView from './ListLocation/Index'
import User from './User'

const Tab = createBottomTabNavigator()

class HomeIndex extends Component {
  constructor (props) {
    super(props)
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn();
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

  render () {
    return (
      <NavigationContainer independent>
        <Tab.Navigator initialRouteName='Home' >
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
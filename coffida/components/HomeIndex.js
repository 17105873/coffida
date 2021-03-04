import 'react-native-gesture-handler'

import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import AsyncStorage from '@react-native-community/async-storage'

import Home from './Home'
import MapView from './MapView/MapView'
import ListView from './ListView/Index'
import User from './User/User'

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
      <Tab.Navigator initialRouteName='Home' style={styles.tabNav}>
        <Tab.Screen name='Map View' component={MapView} />
        <Tab.Screen name='List View' component={ListView} />
        <Tab.Screen name='Home' component={Home} />
        <Tab.Screen name='User Details' component={User} />
      </Tab.Navigator>
    )
  }
}

const styles = StyleSheet.create({
  tabNav: {
    backgroundColor: 'black',
    padding: 10
  }
})

export default HomeIndex

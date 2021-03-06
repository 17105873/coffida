import 'react-native-gesture-handler'

import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import AsyncStorage from '@react-native-community/async-storage'
import Ionicons from 'react-native-vector-icons/Ionicons'

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
      <Tab.Navigator initialRouteName='Home'
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline'
            } else if (route.name === 'List View') {
              iconName = focused ? 'list-circle' : 'list-circle-outline'
            } else if (route.name === 'Map View') {
              iconName = focused ? 'navigate-circle' : 'navigate-circle-outline'
            } else if (route.name === 'User Details') {
              iconName = focused ? 'person' : 'person-outline'
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />

          }
        })}
        tabBarOptions={{
          activeTintColor: 'white',
          inactiveTintColor: 'red',
          activeBackgroundColor: 'black',
          inactiveBackgroundColor: 'black'
        }}
      >
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

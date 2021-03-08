import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ListView from './ListView/ListView'
import Details from './ListView/Details'
import Review from './Review/Review'
import TakePicture from './Review/TakePicture'
import Home from './Home'

const Stack = createStackNavigator()

// Allow navigation from the Home & Maps Screen without navigating first to the ListView Screen

class Index extends Component {
  render () {
    return (
      <Stack.Navigator initialRouteName='Home' screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Home' component={Home} />
        <Stack.Screen name='List View' component={ListView} />
        <Stack.Screen name='Details' component={Details} />
        <Stack.Screen name='Review' component={Review} />
        <Stack.Screen name='TakePicture' component={TakePicture} />
      </Stack.Navigator>
    )
  }
}

export default Index

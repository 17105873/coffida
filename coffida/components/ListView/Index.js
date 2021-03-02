import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ListView from './ListView'
import Details from './Details'
import Review from './Review'
import TakePicture from './TakePicture'

const Stack = createStackNavigator()

class Index extends Component {
  render () {
    return (
      <Stack.Navigator initialRouteName='List View' screenOptions={{ headerShown: false }}>
        <Stack.Screen name='List View' component={ListView} />
        <Stack.Screen name='Details' component={Details} />
        <Stack.Screen name='Review' component={Review} />
        <Stack.Screen name='TakePicture' component={TakePicture} />
      </Stack.Navigator>
    )
  }
}

export default Index

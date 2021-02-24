import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ListView from './ListView'
import Details from './Details'

const Stack = createStackNavigator()

class Index extends Component {
  render () {
    return (
      <Stack.Navigator initialRouteName='List View'>
        <Stack.Screen name='List View' component={ListView} />
        <Stack.Screen name='Details' component={Details} />
      </Stack.Navigator>
    )
  }
}

export default Index
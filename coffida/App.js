import 'react-native-gesture-handler'
import React, { Component } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Login from './components/Login'
import SignUp from './components/SignUp'
import Index from './components/Index'
import HomeIndex from './components/HomeIndex'

const Stack = createStackNavigator()

class App extends Component {
  render () {
    return (
      <NavigationContainer headerMode='none'>
        <Stack.Navigator initialRouteName='Index' screenOptions={{ headerShown: false }}>
          <Stack.Screen name='Index' component={Index} />
          <Stack.Screen name='HomeIndex' component={HomeIndex} />
          <Stack.Screen name='Login' component={Login} />
          <Stack.Screen name='SignUp' component={SignUp} options={{ title: 'Sign Up' }} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

export default App

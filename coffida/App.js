import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { Text, View, Button } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './components/Login';
import SignUp from './components/SignUp';
import Index from './components/Index';
import Home from './components/Home';

const Stack = createStackNavigator()

class App extends Component {
  render() {

    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Index">
          <Stack.Screen name="Index" component={Index} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Sign Up' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
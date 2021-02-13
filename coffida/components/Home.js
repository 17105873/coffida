import 'react-native-gesture-handler';

import React, { Component } from 'react';
import { Text, View } from 'react-native';

import Login from './Login';
import SignUp from './SignUp';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

class Home extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Map View" component={MapView} />
            <Tab.Screen name="List View" component={ListView} />
          </Tab.Navigator>
        </NavigationContainer>
    );
  }

}

export default Home;
import 'react-native-gesture-handler';

import React, { Component } from 'react';
import { Text, View } from 'react-native';

import MapView from './location/MapView';
import ListView from './location/ListView';
import User from './User';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator()

class Home extends Component {
  constructor(props) {
    super (props);
  }

  render() {
    return(
      <NavigationContainer independent={true}>
          <Tab.Navigator>
            <Tab.Screen name="Map View" component={MapView} />
            <Tab.Screen name="List View" component={ListView} />
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="User Details" component={User} />
          </Tab.Navigator>
        </NavigationContainer>
    );
  }

}

export default Home;
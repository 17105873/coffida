import React, { Component } from 'react';
import { Text, View } from 'react-native';

import Login from './components/Login';

class HelloWorldApp extends Component{
  render(){

  const name = "Luke";

    return (
        <View>
          <Login />
        </View>
    );
  }
}

export default HelloWorldApp;
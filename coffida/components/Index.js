import React, { Component } from 'react';
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native';

class Index extends Component {

  render()
  {

    const navigation = this.props.navigation

    return(
      <View>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text>Log In</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

}


export default Index;
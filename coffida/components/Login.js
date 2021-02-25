import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

class Login extends Component{
  constructor(props){
    super(props);

    this.state = {
      email: '',
      password: ''
    }
  }

  logIn = async () => {

    const navigation = this.props.navigation

    //Validation TO DO
    if (this.state.email == ""){
      ToastAndroid.show("Please Enter Email Address", ToastAndroid.SHORT);
      return
    }

    if (this.state.password == ""){
      ToastAndroid.show("Please Enter Password", ToastAndroid.SHORT);
      return
    }

    return fetch("http://10.0.2.2:3333/api/1.0.0/user/login", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    })
    .then((response) => {
      if(response.status === 200){
        return response.json()
      } else if (response.status === 400) {
        throw "Invalid Email Or Password";
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then(async (responseJson) => {
      console.log(responseJson);
      await AsyncStorage.setItem('@session_token', responseJson.token);
      await AsyncStorage.setItem('@user_id', responseJson.id.toString());
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'HomeIndex'
          },
        ],
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })

  }

  render(){

    return(
      <View>
          <ScrollView>
            <View>
              <Text>Email Address:</Text>
              <TextInput placeholder="Enter Email Address" onChangeText={(email) => this.setState({email})} value={this.state.email} />
            </View>
            <View>
              <Text>Password:</Text>
              <TextInput placeholder="Enter Password" onChangeText={(password) => this.setState({password})} value={this.state.password} />
            </View>
            <View>
              <TouchableOpacity onPress={() => this.logIn()}>
                <Text>Log In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
      </View>
    );
  }

}


export default Login;
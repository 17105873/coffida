import React, { Component } from 'react';
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity } from 'react-native';

class Login extends Component{
  constructor(props){
    super(props);

    this.state = {
      email: '',
      password: ''
    }
  }

  handleEmailInput = (email) => {
    this.setState({email: email})
  }

  handlePasswordInput = (pass) => {
    this.setState({password: pass})
  }

  logIn = () => {
    
  }

  render(){
    return(
      <View>
          <ScrollView>
            <View>
              <Text>Email Address:</Text>
              <TextInput placeholder="Enter Email Address" onChangeText={this.handleEmailInput} value={this.state.email} />
            </View>
            <View>
              <Text>Password:</Text>
              <TextInput placeholder="Enter Password" onChangeText={this.handlePasswordInput} value={this.state.password} />
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
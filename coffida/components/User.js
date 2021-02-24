import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

class SignUp extends Component {
  constructor (props) {
    super(props)

    this.state = {
      userDetails: [],
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()

      this.getUserDetails()
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  checkLoggedIn = async () => {
    const token = await AsyncStorage.getItem('@session_token')
    if (token == null) {
      this.props.navigation.navigate('Login')
    }
  }


  getUserDetails = async () => {

    const token = await AsyncStorage.getItem('@session_token')
    const userId = await AsyncStorage.getItem('@user_id')

    return fetch('http://10.0.2.2:3333/api/1.0.0/user/' + userId, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token
      }
    })
    .then((response) => {
      if(response.status === 200){
        return response.json()
      } else if (response.status === 401) {
        ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT);
        this.props.navigation.navigate('Login')
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then((responseJson) => {
      this.setState({
        isLoading: false,
        userDetails: responseJson
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  logOut = async () => {

    const token = await AsyncStorage.getItem('@session_token')

    return fetch('http://10.0.2.2:3333/api/1.0.0/user/logout', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token
      }
    })
      .then(async (response) => {
        if (response.status === 200) {
          await AsyncStorage.clear();
          this.props.navigation.navigate('Index')
        } else if (response.status === 401) {
          throw 'Unathorized'
        } else {
          throw 'Something went wrong. Please try again'
        }
      })
      .catch((error) => {
        console.log(error)
        ToastAndroid.show(error, ToastAndroid.SHORT)
      })
  }

  signUp () {
    // Validation
    if (this.state.first_name == '') {
      throw 'Please Enter Forename'
    }

    if (this.state.last_name == '') {
      throw 'Please Enter Surname'
    }

    if (this.state.email == '') {
      throw 'Please Enter Email Address'
    }

    if (this.state.password == '' || this.state.password.length < 5) {
      throw 'Please Enter Password'
    }

    return fetch('http://10.0.2.2:3333/api/1.0.0/user', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    })
      .then((response) => {
        if (response.status === 201) {
          return response.json()
        } else if (response.status === 400) {
          throw 'Invalid Credentials'
        } else {
          throw 'Something went wrong. Please try again'
        }
      })
      .then((responseJson) => {
        console.log(responseJson)
        this.props.navigation.navigate('Login')
      })
      .catch((error) => {
        console.log(error)
        ToastAndroid.show(error, ToastAndroid.SHORT)
      })
  }

  render () {
    return (
      <View>
        <ScrollView>
          <View>
            <Text>Forename:</Text>
            <TextInput placeholder='Enter Forename' onChangeText={(first_name) => this.setState({ first_name })} value={this.state.first_name} />
          </View>
          <View>
            <Text>Surname:</Text>
            <TextInput placeholder='Enter Surname' onChangeText={(last_name) => this.setState({ last_name })} value={this.state.last_name} />
          </View>
          <View>
            <Text>Email Address:</Text>
            <TextInput placeholder='Enter Email Address' onChangeText={(email) => this.setState({ email })} value={this.state.email} />
          </View>
          <View>
            <Text>Password:</Text>
            <TextInput placeholder='Enter Password' onChangeText={(password) => this.setState({ password })} value={this.state.password} />
          </View>
          <View>
            <TouchableOpacity onPress={() => this.logOut()}>
              <Text>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }
}

export default SignUp

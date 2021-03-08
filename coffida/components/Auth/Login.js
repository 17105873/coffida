import React, { Component } from 'react'
import { Text, TextInput, View, ScrollView, TouchableOpacity, ToastAndroid, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

import GlobalStyles from '../Helpers/Style'

class Login extends Component{
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      password: ''
    }
  }

  logIn = async () => {

    const navigation = this.props.navigation

    //Validation TO DO
    if (this.state.email == '') {
      ToastAndroid.show('Please Enter Email Address', ToastAndroid.SHORT)
      return
    }

    if (this.state.password == '') {
      ToastAndroid.show('Please Enter Password', ToastAndroid.SHORT)
      return
    }

    return fetch('http://10.0.2.2:3333/api/1.0.0/user/login', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    })
    .then((response) => {
      if(response.status === 200) {
        return response.json()
      } else if (response.status === 400) {
        ToastAndroid.show('Invalid Email Or Password', ToastAndroid.SHORT)
        return null
      } else {
        ToastAndroid.show('An Error Occured. Please Try Again', ToastAndroid.SHORT)
        return null
      }
    })
    .then(async (responseJson) => {
      if (responseJson !== null)
      {
        console.log(responseJson)
        await AsyncStorage.setItem('@session_token', responseJson.token)
        await AsyncStorage.setItem('@user_id', responseJson.id.toString())
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'HomeIndex'
            },
          ],
        })
      }
    })
    .catch((error) => {
      console.log(error)
      ToastAndroid.show(error, ToastAndroid.SHORT)
    })

  }

  render() {

    return(
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerView}>
          <Text style={styles.header}>Log In</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address:</Text>
          <TextInput placeholder='Enter Email Address' placeholderTextColor='red' style={styles.input}  onChangeText={(email) => this.setState({email})} value={this.state.email} />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password:</Text>
          <TextInput placeholder='Enter Password' placeholderTextColor='red' style={styles.input}  onChangeText={(password) => this.setState({password})} value={this.state.password} secureTextEntry />
        </View>
        <View style={[GlobalStyles.btnContainer, styles.btnContainer]}>
          <TouchableOpacity style={styles.submitBtn} onPress={() => this.props.navigation.navigate('Index')}>
            <Text style={styles.submitBtnTxt}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={() => this.logIn()}>
            <Text style={styles.submitBtnTxt}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    backgroundColor: '#FFA5AD'
  },
  inputContainer: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  label: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 35,
    marginHorizontal: 10
  },
  input: {
    borderWidth: 2,
    borderColor: 'red',
    fontSize: 30,
    marginHorizontal: 10,
    color: 'red'
  },
  headerView: {
    textAlign: 'center',
    justifyContent: 'center'
  },
  header: {
    color: 'red',
    fontSize: 100,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  btnContainer: {
    marginTop: 50
  },
  submitBtn: {
    padding: 10,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'red',
    margin: 10
  },
  submitBtnTxt: {
    fontSize: 25,
    color: 'white'
  }
})

export default Login

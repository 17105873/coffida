import React, { Component } from 'react'
import { Text, TextInput, View, ScrollView, TouchableOpacity, ToastAndroid, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

import GlobalStyles from '../Helpers/Style'

class SignUp extends Component {
  constructor (props) {
    super(props)

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    }
  }

  signUp = async () => {
  
    // Validation
    if (this.state.first_name === '') {
      ToastAndroid.show('Please Enter Forename', ToastAndroid.SHORT)
      return
    }

    if (this.state.last_name === '') {
      ToastAndroid.show('Please Enter Surname', ToastAndroid.SHORT)
      return
    }

    if (this.state.email === '') {
      ToastAndroid.show('Please Enter Email Address', ToastAndroid.SHORT)
      return
    } else {
      const regEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

      if(!regEx.test(this.state.email)) {
        ToastAndroid.show('Please Enter Valid Email Address', ToastAndroid.SHORT)
        return
      }
    }

    if (this.state.password === '') {
      ToastAndroid.show('Please Enter Password', ToastAndroid.SHORT)
      return
    } else if (this.state.password.length < 5) {
      ToastAndroid.show('Password Must Be At Least 5 Characters', ToastAndroid.SHORT)
      return
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
          ToastAndroid.show('Ivalid Credentials. Please Try Again', ToastAndroid.SHORT)
          return null
        } else {
          ToastAndroid.show('An Error Occured. Please Try Again', ToastAndroid.SHORT)
          return null
        }
      })
      .then((responseJson) => {
        if (responseJson !== null) {
          console.log(responseJson)
          ToastAndroid.show('Sign Up Successful', ToastAndroid.SHORT)
          this.props.navigation.navigate('Login')
        }
      })
      .catch((error) => {
        console.log(error)
        ToastAndroid.show(error, ToastAndroid.SHORT)
      })
  }

  render () {
    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerView}>
          <Text style={styles.header}>Sign Up</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Forename:</Text>
          <TextInput placeholder='Enter Forename' placeholderTextColor='red' style={styles.input} onChangeText={(first_name) => this.setState({ first_name })} value={this.state.first_name} />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Surname:</Text>
          <TextInput placeholder='Enter Surname' placeholderTextColor='red' style={styles.input} onChangeText={(last_name) => this.setState({ last_name })} value={this.state.last_name} />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address:</Text>
          <TextInput placeholder='Enter Email Address' placeholderTextColor='red' style={styles.input} onChangeText={(email) => this.setState({ email })} value={this.state.email} />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password:</Text>
          <TextInput placeholder='Enter Password' placeholderTextColor='red' style={styles.input} onChangeText={(password) => this.setState({ password })} value={this.state.password} secureTextEntry />
        </View>
        <View style={[GlobalStyles.btnContainer, styles.btnContainer]}>
          <TouchableOpacity style={[GlobalStyles.submitBtn, styles.submitBtn]} onPress={() => this.props.navigation.navigate('Index')}>
            <Text style={styles.submitBtnTxt}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[GlobalStyles.submitBtn, styles.submitBtn]} onPress={() => this.signUp()}>
            <Text style={styles.submitBtnTxt}>Sign Up</Text>
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
    justifyContent: 'center'
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
    marginTop: 20
  },
  submitBtn: {
    padding: 10,
    borderWidth: 2
  },
  submitBtnTxt: {
    fontSize: 25,
    color: 'white'
  }
})

export default SignUp

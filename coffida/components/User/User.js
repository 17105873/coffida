import React, { Component } from 'react'
import { Text, TextInput, View, ScrollView, TouchableOpacity, ToastAndroid, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { CommonActions } from '@react-navigation/native'

import Loading from '../Helpers/Loading'
import Helper from '../Helpers/Helper'
import GlobalStyles from '../Helpers/Style'

class UserDetails extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
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

    Helper.getUserDetails().then((responseJson) => {
      if (responseJson == 'Login') {
        ToastAndroid.show('You\'re not Logged In', ToastAndroid.SHORT)
        this.props.navigation.navigate('Login')
        return
      } else if (responseJson == 'Error') {
        ToastAndroid.show('There Was An Error. Please Try Again', ToastAndroid.SHORT)
        return
      } else {
        this.setState({
          isLoading: false,
          first_name: responseJson.first_name,
          last_name: responseJson.last_name,
          email: responseJson.email
        })
      }
    })
    .catch((error) => {
      console.log(error)
      ToastAndroid.show(error, ToastAndroid.SHORT)
    })
  }

  logOut = async () => {

    const navigation = this.props.navigation

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
        await AsyncStorage.clear()
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Index' },
            ],
          })
        )
      } else if (response.status === 401) {
        ToastAndroid.show('You\'re not Logged In', ToastAndroid.SHORT)
        this.props.navigation.navigate('Login')
        return
      } else {
        ToastAndroid.show('There Was An Error. Please Try Again', ToastAndroid.SHORT)
        return
      }
    })
    .catch((error) => {
      console.log(error)
      ToastAndroid.show(error, ToastAndroid.SHORT)
    })
  }

  updateDetails = async () => {

    const userId = await AsyncStorage.getItem('@user_id')
    const token = await AsyncStorage.getItem('@session_token')

    // Validation
    if (this.state.first_name == '') {
      ToastAndroid.show('Please Enter Forename', ToastAndroid.SHORT)
      return
    }

    if (this.state.last_name == '') {
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

    if (this.state.password == '' || this.state.password.length < 5) {
      ToastAndroid.show('Please Enter Password', ToastAndroid.SHORT)
      return
    }

    return fetch('http://10.0.2.2:3333/api/1.0.0/user/' + userId, {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token
      },
      body: JSON.stringify(this.state)
    })
    .then((response) => {
      if (response.status === 200) {
        ToastAndroid.show('Successfully Updated Details', ToastAndroid.SHORT)
        return
      } else if (response.status === 401) {
        ToastAndroid.show('You\'re not Logged In', ToastAndroid.SHORT)
        this.props.navigation.navigate('Login')
        return
      } else {
        ToastAndroid.show('There Was An Error. Please Try Again', ToastAndroid.SHORT)
        return
      }
    })
    .catch((error) => {
      console.log(error)
      ToastAndroid.show(error, ToastAndroid.SHORT)
    })
  }

  render () {

    if(this.state.isLoading == true) {
      return(
        <Loading />
      )
    } else {
      return (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.headerView}>
            <Text style={styles.header}>Update Details</Text>
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
            <TouchableOpacity style={GlobalStyles.submitBtn} onPress={() => this.updateDetails()}>
              <Text style={styles.submitBtnTxt}>Update Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={GlobalStyles.submitBtn} onPress={() => this.logOut()}>
              <Text style={styles.submitBtnTxt}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )
    }
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
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  btnContainer: {
    marginTop: 20
  },
  submitBtnTxt: {
    fontSize: 25,
    color: 'white'
  }
})

export default UserDetails

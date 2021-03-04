import 'react-native-gesture-handler'

import React, { Component } from 'react'
import { Text, View, StyleSheet, ImageBackground, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

import backgroundImg from '../resources/img/home_bg2.png'

class Home extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      forename: '',
      surname: ''
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
        forename: responseJson.first_name,
        surname: responseJson.last_name
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })

  }

  render () {

    return (
      <ScrollView style={styles.scrollContainer}>
        <ImageBackground source={backgroundImg} style={styles.image}>
          <View style={styles.headerView}>
            <Text style={styles.header}>Welcome</Text>
            <Text style={styles.header}>{this.state.forename + ' ' + this.state.surname}</Text>
          </View>
        </ImageBackground>
        <View style={styles.recent}>
          <Text>Recent Reviews</Text>
        </View>
      </ScrollView>
    )
  }
}


const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#FFA5AD',
    flexDirection: 'column',
    flex: 1
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    height: 300
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
    backgroundColor:'rgba(0,0,0,0.75)',
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1
  },
  header: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    opacity: 1
  },
  recent: {
    flex: 1
  }
})

export default Home

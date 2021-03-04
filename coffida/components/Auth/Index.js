import React, { Component } from 'react'
import { Text, View, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native'

import backgroundImg from '../../resources/img/index_bg.jpg'
import signUpImg from '../../resources/img/signup.png'
import loginImg from '../../resources/img/login.png'

class Index extends Component {
  render () {
    const navigation = this.props.navigation

    return (
      <View style={styles.container}>
        <ImageBackground source={backgroundImg} style={styles.image}>
          <View style={styles.headerView}>
            <Text style={styles.header}>Coffida</Text>
          </View>
          <View style={styles.buttonContainerSignUp}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Image style={styles.navImg} source={signUpImg} />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainerLogIn}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Image style={styles.navImg} source={loginImg} />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  buttonContainerLogIn: {
    alignItems: 'center',
    flex: 2
  },
  buttonContainerSignUp: {
    alignItems: 'center',
    flex: 1
  },
  button: {
    textAlign: 'center',
    color: 'red',
    fontSize: 30,
    backgroundColor: 'white'
  },
  headerView: {
    flex: 2,
    textAlign: 'center',
    justifyContent: 'center'
  },
  header: {
    color: 'white',
    fontSize: 100,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  navImg: {
    justifyContent: 'center'
  }
})

export default Index

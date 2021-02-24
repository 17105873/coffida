import React, { Component } from 'react'
import { Text, View, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native'

import image from '../resources/img/index_bg.jpg'

class Index extends Component {
  render () {
    const navigation = this.props.navigation

    return (
      <View style={styles.container}>
        <ImageBackground source={image} style={styles.image}>
          <View>
            <Text style={styles.header}>Coffida</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.button}>Log In</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.button}>Sign Up</Text>
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
  buttonContainer: {
    flex: 0.25
  },
  button: {
    textAlign: 'center',
    color: 'red',
    fontSize: 30,
    backgroundColor: 'white'
  },
  header: {
    color: 'white',
    fontSize: 50,
    textAlign: 'center'
  }
})

export default Index

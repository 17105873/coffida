import React, { Component } from 'react'
import { Text, View, TouchableOpacity, ToastAndroid, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { RNCamera } from 'react-native-camera'
import { LogBox } from 'react-native'

import GlobalStyles from '../Helpers/style'

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state'])

class TakePicture extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()
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

  takePicture = async() => {
    if (this.camera) {
      const options = {quality: 0.5, base64: true}
      const data = await this.camera.takePictureAsync(options);
      const { navigation, route } = this.props;
      navigation.goBack();
      route.params.setPhoto(data);
    }
  }

  render () {

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.camera}
          captureAudio={false}
        >
          <View style={styles.btnContainer}>
            <TouchableOpacity style={[GlobalStyles.submitBtn, styles.submitBtn]} onPress={() => this.props.navigation.goBack()}>
              <Text style={[GlobalStyles.submitBtnTxt, styles.submitBtnTxt]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[GlobalStyles.submitBtn, styles.submitBtn]} onPress={() => this.takePicture()}>
              <Text style={[GlobalStyles.submitBtnTxt, styles.submitBtnTxt]}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </RNCamera>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  camera: {
    flex: 1
  },
  btnContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  submitBtn: {
    flex: 1
  },
  submitBtnTxt: {
    textAlign: 'center'
  }
})


export default TakePicture

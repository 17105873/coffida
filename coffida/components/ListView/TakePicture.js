import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid, Image, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { RNCamera } from 'react-native-camera'
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
 'Non-serializable values were found in the navigation state',
]);

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
            <TouchableOpacity style={styles.submitBtn} onPress={() => this.props.navigation.goBack()}>
              <Text style={styles.submitBtnTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={() => this.takePicture()}>
              <Text style={styles.submitBtnTxt}>Take Photo</Text>
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
    padding: 15,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'red',
    margin: 10,
    flex: 1
  },
  submitBtnTxt: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'MinionPro-Regular',
    textAlign: 'center'
  }
})


export default TakePicture

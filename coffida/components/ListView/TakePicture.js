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
        />
        <View>
          <TouchableOpacity onPress={() => this.takePicture()}>
            <Text>Take Photo</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  camera: {
    flex: 1
  }
})


export default TakePicture

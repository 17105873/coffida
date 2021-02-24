import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

class ListView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      listData: []
    }

  }
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()

      this.getData()
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

  getData = async () => {

    return fetch("http://10.0.2.2:3333/api/1.0.0/find", {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('@session_token')
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
        listData: responseJson
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  viewDetails(itemId) {

  }


  render () {

    if (this.state.isLoading == true)
    {
      return (
        <View>
          <Text>List View 123</Text>
        </View>
      )
    } else {
      return (
        <View>
          <Text>List View 456</Text>
          <FlatList 
            data={this.state.listData}
            renderItem={({item}) => (
              <View>
                <Text>{item.location_name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate('Details', {
                      itemId: item.location_id
                    });
                  }}
                >
                  <Text>Details</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item,index) => item.location_id.toString()}
          />
        </View>
      )
    }
  }
}

export default ListView

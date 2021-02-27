import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

class Details extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      favLocation: false,
      locationId: this.props.route.params.locationId,
      locationName: '',
      details: [],
      userReviews: [],
      likedReviews: []
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()

      this.getDetails()
      this.getLikedReviews()
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

  getDetails = async () => {

    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId, {
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
        locationName: responseJson.location_name,
        details: responseJson
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  favouriteLocation = async ({favLoc}) => {

    var action

    if (favLoc) {
      action = 'post'
    } else {
      action = 'delete'
    }

    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId + "/favourite", {
      method: action,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('@session_token')
      },
      body: {
        'loc_id': this.state.locationId
      }
    })
    .then((response) => {
      if(response.status === 200){
        return
      } else if (response.status === 401) {
        ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT);
        this.props.navigation.navigate('Login')
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then(() => {
      this.setState({
        favLocation: favLoc ? true : false
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  getLikedReviews = async() => {

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
        userReviews: responseJson.reviews,
        likedReviews: responseJson.liked_reviews
      })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })

  }

  reviewAction = async(reviewId, method) => {

    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId + "/review/" + reviewId + "/like", {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('@session_token')
      }
    })
    .then((response) => {
      if(response.status === 200){
        return
      } else if (response.status === 401) {
        ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT);
        this.props.navigation.navigate('Login')
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then(() => {
      this.getLikedReviews()
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  deleteReview = async(reviewId) => {
    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId + "/review/" + reviewId, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('@session_token')
      }
    })
    .then((response) => {
      if(response.status === 200){
        return
      } else if (response.status === 401) {
        ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT);
        this.props.navigation.navigate('Login')
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then(() => {
      this.getDetails()
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  renderLikeButton(currentReviewId) {

    if(this.state.likedReviews.every((item) => item.review.review_id !== currentReviewId)){
      return(
        <TouchableOpacity
          onPress={() => {
            this.reviewAction(currentReviewId, 'post');
          }}>
          <Text>Like</Text>
        </TouchableOpacity>
      )
    } else {
      return(
        <TouchableOpacity
            onPress={() => {
              this.reviewAction(currentReviewId, 'delete');
            }}>
            <Text>UnLike</Text>
        </TouchableOpacity>
      )
    }
  }

  renderDeleteButton(currentItem) {

    if(this.state.userReviews.length !== 0) {
      if(this.state.userReviews.every((item) => item.review.review_id !== currentItem.review_id)){
        // Do Nothing
      } else {
        return(
          <View>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('Review', {
                  review_id: currentItem.review_id
                });
              }}>
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.deleteReview(currentItem.review_id);
              }}>
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        )
      }
    }
  }

  render () {

    let favLocText
    let favLoc

    if(this.state.favLocation == true) {
      favLocText = 'Unfavourite Location'
      favLoc = false;
    } else {
      favLocText = 'Favourite Location'
      favLoc = true;
    }

    if(this.state.isLoading == true) {
      return (
        <View>
          <Text>Details</Text>
        </View>
      )
    } else {
      return (
        <View>
          <Text>Details</Text>
          <View>
            <Text>{this.state.details.location_name}</Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => this.favouriteLocation({favLoc})}>
              <Text>{favLocText}</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('Review', {
                  locationId: this.state.locationId,
                  locationName: this.state.locationName
                });
              }}
            >
              <Text>Write Review</Text>
            </TouchableOpacity>
          </View>
          <FlatList 
            data={this.state.details.location_reviews}
            renderItem={({item}) => (
              <View>
                <Text>{item.review_body}</Text>
                {this.renderLikeButton(item.review_id)}
                {this.renderDeleteButton(item)}
              </View>
            )}
            keyExtractor={(item,index) => item.review_id.toString()}
          />
        </View>
      )
    }
  }
}

export default Details

import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid, Image } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

let asyncToken

class Details extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      favLocation: false,
      locationId: this.props.route.params.locationId,
      locationName: '',
      likeButton: [],
      actionButton: [],
      details: [],
      images: []
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()

      this.getDetails(false)
      this.getUserSpecific()
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  checkLoggedIn = async () => {
//    const token = await AsyncStorage.getItem('@session_token')
    asyncToken = await AsyncStorage.getItem('@session_token')
    
    if (asyncToken == null) {
      this.props.navigation.navigate('Login')
    }
  }

  getDetails = async (blnUpdate) => {

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
      if (blnUpdate == false) {
        this.initialiseImage(responseJson)
      }

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

  getUserSpecific = async() => {

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
      this.initialiseLikeBtn(responseJson)
      this.initialiseActionBtn(responseJson)
      this.initialiseFavouriteLoc(responseJson)
      this.setState({
        isLoading: false
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
        this.state.likeButton[reviewId] = ( method == 'post' ) ? true : false
        this.setState({
          isLoading: false
        })
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
      this.getDetails(true)
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  initialiseImage = async(responseJson) => {

    let imgs = {}

    try{
      responseJson.location_reviews.map(async(item) => {

        return fetch('http://10.0.2.2:3333/api/1.0.0/location/' + this.state.locationId + "/review/" + item.review_id + "/photo", {
          method: 'get',
          headers: {
            'Content-Type': 'image/jpeg',
            'X-Authorization': asyncToken
          }
        })
        .then((response) => {
          if(response.status === 200){
            return response
          } else if (response.status === 401) {
            ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT);
            this.props.navigation.navigate('Login')
          } else if (response.status === 404) {
            //No Image For Review
            return null
          } else {
            throw "Something went wrong. Please try again";
          }
        })
        .then((response) => {
          if (response !== null) {
            imgs[item.review_id] = response
          } else {
            imgs[item.review_id] = null
          }
          return
        })
        .catch((error) => {
          console.log(error);
          ToastAndroid.show(error, ToastAndroid.SHORT);
        })

      })
    } catch(error) {
      console.log(error)
    }

    this.setState({
      images: imgs
    })
    
  }

  initialiseLikeBtn(responseJson) {
    let likeBtn = {}

    // Loop through location reviews & liked reviews and assign true/false to corresponding object item
    this.state.details.location_reviews.map((item) => {        
      responseJson.liked_reviews.map((likedItem) => {
        if (item.review_id == likedItem.review.review_id) {
          likeBtn[item.review_id] = true
        }
      })

      if(!likeBtn[item.review_id]) {
        likeBtn[item.review_id] = false
      }
    })

    this.setState({
      likeButton: likeBtn
    })
  }

  initialiseActionBtn(responseJson) {
    let actionBtn = {}

    // Loop through location reviews & user written reviews and assign true/false to corresponding object item
    this.state.details.location_reviews.map((item) => {
      responseJson.reviews.map((userItem) => {
        if (item.review_id == userItem.review.review_id) {
          actionBtn[item.review_id] = true
        }
      })

      if(!actionBtn[item.review_id]) {
        actionBtn[item.review_id] = false
      }
    })

    this.setState({
      actionButton: actionBtn
    })
  }

  initialiseFavouriteLoc(responseJson) {
    responseJson.favourite_locations.map((item) => {
      if (item.location_id == this.state.locationId) {
        this.setState({
          favLocation: true
        })
      }
    })
  }

  renderLikeButton(currentReviewId) {

    if(!this.state.likeButton[currentReviewId]) {
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

    if(this.state.actionButton[currentItem.review_id]){
      return(
        <View>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('Review', {
                locationId: this.state.details.location_id,
                locationName: this.state.details.location_name,
                review_id: currentItem.review_id,
                overall_rating: currentItem.overall_rating,
                price_rating: currentItem.price_rating,
                quality_rating: currentItem.quality_rating,
                clenliness_rating: currentItem.clenliness_rating,
                review_body: currentItem.review_body
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

  renderImage(currentReviewId) {

    if(this.state.images[currentReviewId] !== null) {

      return(
        <View><Image style={{width: 100, height: 50, borderWidth: 1, borderColor: 'black'}} source={{uri: this.state.images[currentReviewId].url}}/></View>
      )
    } else {
      return
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
            LisHeaderComponent={
              <>
              </>}
            data={this.state.details.location_reviews}
            renderItem={({item}) => (
              <View>
                <Text>{item.review_body}</Text>
                {this.renderLikeButton(item.review_id)}
                {this.renderDeleteButton(item)}
                {this.renderImage(item.review_id)}
              </View>
            )}
            keyExtractor={(item,index) => item.review_id.toString()}
            ListFooterComponent={
              <>
              </>
            }/>
        </View>
      )
    }
  }
}

export default Details

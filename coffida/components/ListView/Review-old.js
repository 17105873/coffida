import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid, Image, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

import Loading from '../Loading/Loading'
import Helper from '../Helpers/Helper'
import GlobalStyles from '../Helpers/style'

const starBlank = '../../resources/img/star_rating_blank.png'
const starActive = '../../resources/img/star_rating_active.png'

let asyncToken
let asyncUserId

class Review extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      locationId: this.props.route.params.locationId,
      locationName: this.props.route.params.locationName,
      reviewType: 'Submit',
      reviewId: 0,
      overall_rating: 0,
      price_rating: 0,
      quality_rating: 0,
      clenliness_rating: 0,
      review_body: '',
      photo: null,
      newPhoto: false
    }
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkLoggedIn()
      this.checkUpdate()
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  checkLoggedIn = async () => {
    asyncToken = await AsyncStorage.getItem('@session_token')
    asyncUserId = await AsyncStorage.getItem('@user_id')
    if (asyncToken == null) {
      this.props.navigation.navigate('Login')
    }
  }

  checkUpdate() {

    //Instead Of Making Another Database Call Values Are Passed Through On Route
    if(this.props.route.params.reviewData !== undefined) {
      this.setState({
        overall_rating: this.props.route.params.reviewData.overall_rating,
        price_rating: this.props.route.params.reviewData.price_rating,
        quality_rating: this.props.route.params.reviewData.quality_rating,
        clenliness_rating: this.props.route.params.reviewData.clenliness_rating,
        review_body: this.props.route.params.reviewData.review_body,
        reviewType: 'Update',
        reviewId: this.props.route.params.reviewData.review_id,
        isLoading: false
      })
      this.getImage(this.props.route.params.reviewData.review_id)
    } else {
      this.setState({ isLoading: false })
    }
  }

  submitReview = async(reviewType) => {

    var endPoint;
    var method;

    if (reviewType =='Submit') {
      endPoint = "http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId + "/review"
      method = 'post'
    } else {
      endPoint = "http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId + "/review/" + this.state.reviewId
      method = 'patch'
    }

    //Validation TO DO
    if (this.state.price_rating == 0){
      ToastAndroid.show("Please Select Price Rating", ToastAndroid.SHORT);
      return
    }

    if (this.state.quality_rating == 0){
      ToastAndroid.show("Please Select Quality Rating", ToastAndroid.SHORT);
      return
    }

    if (this.state.clenliness_rating == 0){
      ToastAndroid.show("Please Select Cleanliness Rating", ToastAndroid.SHORT);
      return
    }

    if (this.state.review_body == ''){
      ToastAndroid.show("Please Enter Review", ToastAndroid.SHORT);
      return
    } else {
      const regEx = /(cake|tea|pastr)/gi

      if(regEx.test(this.state.review_body)){
        ToastAndroid.show("Review Cannot Mention Cakes, Tea or Pastries", ToastAndroid.SHORT);
        return
      }
    }

    return fetch(endPoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': asyncToken
      },
      body: JSON.stringify(this.state)
    })
    .then((response) => {
      if(response.status === 201){
        //New Review Created Then Retrieve New Review Id
        this.getLatestReview()
        return
      } else if (response.status === 200) {
        //If Update Then No Need To Retrieve New id
        this.uploadPhoto(this.state.reviewId)
        return
      } else if (response.status === 400) {
        throw "Invalid Details";
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  uploadPhoto = async(reviewId) => {

    if (this.state.newPhoto == false) {
      this.props.navigation.goBack()
      return
    }

    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId + "/review/" + reviewId + "/photo", {
      method: 'post',
      headers: {
        'Content-Type': "image/jpeg",
        'X-Authorization': asyncToken
      },
      body: this.state.photo
    })
    .then((response) => {
      if(response.status === 200){
        return
      } else if (response.status === 400) {
        throw "Invalid Upload Type";
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then(() => {
      this.props.navigation.goBack()
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })
  }

  getLatestReview = async() => {

    return fetch('http://10.0.2.2:3333/api/1.0.0/user/' + asyncUserId, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': asyncToken
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

      //Get Id of Review Just Inserted
      let newReviewId;

      responseJson.reviews.map((userReview) => {
        if (newReviewId == null || parseInt(userReview.review.review_id) > newReviewId) {
          newReviewId = userReview.review.review_id
        }
      })

      this.uploadPhoto(newReviewId)
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })

  }

  getImage = async(reviewId) => {

    return fetch('http://10.0.2.2:3333/api/1.0.0/location/' + this.state.locationId + "/review/" + reviewId + "/photo", {
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
        this.setState({ photo: response }) 
      }
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })

  }

  deletePhoto = async() => {

    if (this.state.reviewType == 'Submit')
    {
      this.setState({ photo: null })
      return
    }

    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId + "/review/" + this.state.reviewId + "/photo", {
      method: 'delete',
      headers: {
        'X-Authorization': asyncToken
      }
    })
    .then((response) => {
      if(response.status === 200){
        return
      } else if (response.status === 400) {
        throw "Invalid Upload Type";
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then(() => {
      this.setState({ photo: null })
    })
    .catch((error) => {
      console.log(error);
      ToastAndroid.show(error, ToastAndroid.SHORT);
    })

  }

  UpdateRating(key, rating_type)
  {
    this.setState({ [rating_type]: key });
  }

  renderRating(ratingType) {
    let ratingRow = [];
 
    for( var i = 1; i <= 5; i++ )
    {
      ratingRow.push(
        <TouchableOpacity
          key = { i } 
          onPress = { this.UpdateRating.bind( this, i, ratingType ) }>
            <Image 
              style = { styles.StarImage }
              source = { ( i <= this.state[ratingType] ) ? require(starActive) : require(starBlank) } />
        </TouchableOpacity>
      );
    }

    return ratingRow;
  }

  imageControl() {

    var imgSrc

    if (this.state.photo !== null) {

      if (this.state.photo.url !== undefined) {
        imgSrc = this.state.photo.url
      } else {
        imgSrc = this.state.photo.uri
      }

      return(
        <View style={styles.photoContainer}>
          <Image style={{width: 150, height: 125, borderWidth: 1, borderColor: 'black', padding: 15, marginLeft: 5}} source={{uri: imgSrc}}/>
          <TouchableOpacity style={[GlobalStyles.submitBtn, styles.deletePhotoBtn]} onPress={() => this.deletePhoto()}>
            <Text style={GlobalStyles.submitBtnTxt}>Delete Photo</Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  setPhoto = data => {
    this.setState({photo: data, newPhoto: true});
  };

  render () {

    const navigation = this.props.navigation

    if (this.state.isLoading) {
      return <Loading />
    } else {
      return (
        <ScrollView style={GlobalStyles.scrollContainer}>
          <View>
            <View style={styles.headerView}>
              <Text style={styles.header}>Review For {this.state.locationName}</Text>
            </View>
            <View style={[GlobalStyles.inputContainer, styles.inputContainer]}>
              <Text style={styles.ratingLabel}>Price Rating:</Text>
                <View style={styles.ratingRow}>{this.renderRating('price_rating')}</View>
            </View>
            <View style={[GlobalStyles.inputContainer, styles.inputContainer]}>
              <Text style={styles.ratingLabel}>Quality Rating:</Text>
                <View style={styles.ratingRow}>{this.renderRating('quality_rating')}</View>
            </View>
            <View style={[GlobalStyles.inputContainer, styles.inputContainer]}>
              <Text style={styles.ratingLabel}>Cleanliness Rating:</Text>
                <View style={styles.ratingRow}>{this.renderRating('clenliness_rating')}</View>
            </View>
            <View style={[GlobalStyles.inputContainer, styles.inputContainer]}>
              <Text style={styles.ratingLabel}>Overall Rating:</Text>
                <View style={styles.ratingRow}>{this.renderRating('overall_rating')}</View>
            </View>
            <View style={styles.photoContainer}>
              <TouchableOpacity
                style={[GlobalStyles.submitBtn, styles.takePhotoBtn]}
                onPress={() => {
                  this.props.navigation.navigate('TakePicture', {
                    setPhoto: this.setPhoto
                  });
                }}
              >
                <Text style={GlobalStyles.submitBtnTxt}>Take Photo</Text>
              </TouchableOpacity>
            </View>
            {this.imageControl()}
            <View style={[GlobalStyles.inputContainer, styles.inputContainer]}>
              <Text style={styles.ratingLabel}>Review:</Text>
              <TextInput
                placeholder='Review Details...'
                placeholderTextColor='red'
                onChangeText={(review_body) => this.setState({review_body})}
                value={this.state.review_body}
                multiline={true}
                style={styles.reviewBody}
                numberOfLines={4} />
            </View>
            <View style={[GlobalStyles.btnContainer, styles.btnContainer]}>
              <TouchableOpacity style={GlobalStyles.submitBtn} onPress={() => navigation.goBack()}>
                <Text style={GlobalStyles.submitBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={GlobalStyles.submitBtn} onPress={() => this.submitReview(this.state.reviewType)}>
                <Text style={GlobalStyles.submitBtnTxt}>{this.state.reviewType}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )
    }
  }
} 

const styles = StyleSheet.create({
  ratingRow: {
    flex: 1,
    flexDirection: 'row'
  },
  StarImage: {
    width: 35,
    height: 35
  },
  headerView: {
    backgroundColor:'rgba(255, 165, 173,0.75)',
    textAlign: 'center'
  },
  header: {
    color: 'white',
    fontSize: 50,
    textAlign: 'center',
    opacity: 1
  },
  ratingLabel: {
    fontSize: 20,
    color: 'red',
    fontFamily: 'Courier New',
    fontWeight: 'bold'
  },
  reviewBody: {
    borderWidth: 1,
    borderColor: 'red',
    fontSize: 20,
    color: 'red',
    fontFamily: 'Courier New'
  },
  btnContainer: {
    marginTop: 20
  },
  inputContainer: {
    padding: 15
  },
  photoContainer: {
    flex: 1,
    textAlign: 'left',
    justifyContent: 'flex-start',
    paddingHorizontal: 15
  },
  takePhotoBtn: {
    margin: 5,
    width: 125
  },
  deletePhotoBtn: {
    margin: 5,
    width: 140,
    height: 60
  }
})


export default Review

import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid, Image, StyleSheet, ImageBackground, Modal, Pressable } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Loading from '../Loading/Loading'
import Helper from '../helpers/Helper'
import GlobalStyles from '../helpers/style'

const starBlank = '../../resources/img/star_rating_blank.png'
const starActive = '../../resources/img/star_rating_active.png'

let asyncToken

class Details extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      modalVisible: false,
      favLocation: false,
      locationId: this.props.route.params.locationId,
      locationName: '',
      likeCount: [],
      likeButton: [],
      actionButton: [],
      details: [],
      images: [],
      opacity: 1
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
      this.initialiseLikeCount(responseJson)
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

  getUserSpecific = async() => {

    Helper.getUserDetails().then((responseJson) => {
      if (responseJson == 'Login'){
        ToastAndroid.show("You're not Logged In", ToastAndroid.SHORT)
        this.props.navigation.navigate('Login')
        return
      } else if (responseJson == 'Error') {
        ToastAndroid.show("There Was An Error. Please Try Again", ToastAndroid.SHORT)
        return
      } else {
        this.initialiseBtn(responseJson)
        this.initialiseFavouriteLoc(responseJson)
        this.setState({
          isLoading: false
        })
      }
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
        this.state.likeCount[reviewId] = (method == 'post') ? (this.state.likeCount[reviewId] + 1) : (this.state.likeCount[reviewId] - 1)
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
            return
          } else if (response.status === 404) {
            //No Image For Review
            return null
          } else {
            ToastAndroid.show("Something went wrong. Please try again", ToastAndroid.SHORT)
            return null
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

  initialiseBtn(responseJson) {
    let likeBtn = {}
    let actionBtn = {}

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

      // Go through users reviews and assign whether can edit/delete review
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
      likeButton: likeBtn,
      actionButton: actionBtn
    })
  }

  initialiseLikeCount(responseJson) {
    
    // Get Like Count For Each Review and Store In State

    let likeCounter = {}

    responseJson.location_reviews.map((item) => {
      likeCounter[item.review_id] = item.likes
    })

    this.setState({
      likeCount: likeCounter
    })
  }

  initialiseFavouriteLoc(responseJson) {

    // Check If User Has Favourited Location

    responseJson.favourite_locations.map((item) => {
      if (item.location_id == this.state.locationId) {
        this.setState({
          favLocation: true
        })
      }
    })
  }

  renderButtons(item) {
    return(
      <View style={styles.actionBtnContainer}>
        {this.renderLikeButton(item)}
        {this.renderDeleteButton(item)}
      </View>
    )
  }

  renderLikeButton(item) {

    if(!this.state.likeButton[item.review_id]) {
      return(
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            this.reviewAction(item.review_id, 'post');
          }}>
          <Text style={styles.actionBtnTxt}>Like</Text>
        </TouchableOpacity>
      )
    } else {
      return(
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            this.reviewAction(item.review_id, 'delete');
          }}>
          <Text style={styles.actionBtnTxt}>UnLike</Text>
        </TouchableOpacity>
      )
    }
  }

  renderDeleteButton(currentItem) {

    if(this.state.actionButton[currentItem.review_id]){
      return(
        <>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              this.props.navigation.navigate('Review', {
                reviewData: currentItem,
                locationId: this.state.details.location_id,
                locationName: this.state.details.location_name
              });
            }}>
            <Text style={styles.actionBtnTxt}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              this.deleteReview(currentItem.review_id);
            }}>
            <Text style={styles.actionBtnTxt}>Delete</Text>
          </TouchableOpacity>
        </>
      )
    }
  }

  renderImage(currentReviewId) {

    // Rendering Image in Review With Modal
    if(this.state.images[currentReviewId] !== null && this.state.images[currentReviewId] !== undefined) {

      return(
        <View style={styles.reviewImg}>
          <TouchableOpacity style={styles.reviewImg} onPress={() => this.setModalVisible(true)}>
            <Image style={styles.imgThumb} source={{uri: this.state.images[currentReviewId].url}}/>
          </TouchableOpacity>
          <Modal
            animationType='slide'
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setModalVisible(false);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Pressable style={styles.closeModal} onPress={() => this.setModalVisible(false)}>
                  <Text style={styles.closeModalBtn}>Close X</Text>
                </Pressable>
                <Image style={styles.imgFull} source={{uri: this.state.images[currentReviewId].url}}/>
              </View>
            </View>
          </Modal>
        </View>
      )
    } else {
      return
    }
  }

  renderRating(value, ratingType) {
    let ratingRow = [];
 
    for(var i = 1; i <= 5; i++ )
    {
      ratingRow.push(
        <Image 
          key = {i}
          style = { ratingType }
          source = { ( i <= Math.round(value) ) ? require(starActive) : require(starBlank) } />
      );
    }

    return ratingRow;
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  render () {

    let favLocText
    let favLoc

    if(this.state.favLocation == true) {
      favLocText = 'Unfavourite'
      favLoc = false;
    } else {
      favLocText = 'Favourite'
      favLoc = true;
    }

    if(this.state.isLoading == true) {
      return(
        <Loading />
      )
    } else {
      return (
        <View style={GlobalStyles.scrollContainer}>
          <ImageBackground source={{uri: this.state.details.photo_path}} style={styles.image}>
            <View style={styles.headerView}>
              <Text style={styles.header}>{this.state.details.location_name}</Text>
              <Text style={styles.headerLocation}>{this.state.details.location_town}</Text>
            </View>
            <View style={styles.ratingRowLoc}>
              {this.renderRating(this.state.details.avg_overall_rating, styles.locationRating)}
            </View>
          </ImageBackground>
          <View style={styles.body}>
            <View style={styles.btnContainer}>
              <TouchableOpacity style={styles.submitBtn} onPress={() => this.favouriteLocation({favLoc})}>
                <Text style={styles.submitBtnTxt}>{favLocText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  this.props.navigation.navigate('Review', {
                    locationId: this.state.locationId,
                    locationName: this.state.locationName
                  });
                }}
              >
                <Text style={styles.submitBtnTxt}>Review</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.reviewRating}>Reviews &amp; Ratings</Text>
            </View>
            <FlatList 
              LisHeaderComponent={
                <>
                </>}
              data={this.state.details.location_reviews}
              renderItem={({item}) => (
                <View style={{borderBottomWidth: 1, borderColor: 'red'}}>
                  <View style={styles.ratingRow}>
                    {this.renderRating(item.overall_rating, styles.indReviewRating)}
                  </View>
                  <Text style={styles.reviewBody}>{item.review_body}</Text>
                  {this.renderButtons(item)}
                  {this.renderImage(item.review_id)}
                  <View style={styles.likeContainer}>
                    <Ionicons name='heart' size={20} color='red' />
                    <Text style={styles.likeCount}>{this.state.likeCount[item.review_id]}</Text>
                  </View>
                </View>
              )}
              keyExtractor={(item,index) => item.review_id.toString()}
              ListFooterComponent={
                <>
                </>
              }/>
            </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
    justifyContent: 'center',
    height: 225
  },
  headerView: {
    backgroundColor:'rgba(255, 165, 173,0.75)',
    textAlign: 'center'
  },
  header: {
    color: 'white',
    fontSize: 70,
    textAlign: 'center',
    opacity: 1
  },
  headerLocation: {
    color: 'black',
    fontFamily: 'Courier New Bold',
    fontSize: 50,
    opacity: 1,
    textAlign: 'center'
  },
  favHeader: {
    flex: 1.5,
    padding: 10
  },
  body: {
    flex: 3
  }, 
  ratingRow: {
    backgroundColor:'rgba(255, 165, 173,0.75)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 10,
    marginTop: 10
  },
  ratingRowLoc: {
    backgroundColor:'rgba(255, 165, 173,0.75)',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  locationRating: {
    width: 35,
    height: 35
  },
  indReviewRating: {
    width: 30,
    height: 30
  },
  btnContainer: {
    flexDirection: 'row',
    textAlign: 'center',
    justifyContent: 'center'
  },
  submitBtn: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'red',
    margin: 10
  },
  submitBtnTxt: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'MinionPro-Regular'
  },
  actionBtnContainer: {
    flexDirection: 'row',
    textAlign: 'left',
    justifyContent: 'flex-start'
  },
  actionBtn: {
    padding: 5,
    margin: 5
  },
  actionBtnTxt: {
    fontSize: 15,
    color: 'red',
    fontFamily: 'MinionPro-Regular',
    fontWeight: 'bold'
  },
  reviewRating: {
    color: 'red',
    fontSize: 25,
    fontFamily: 'MinionPro-Regular',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    marginBottom: 15
  },
  reviewBody: {
    fontFamily: 'CourierNewPSMT',
    color: 'red',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 22
  },
  likeCount: {
    color: 'red',
    fontWeight: 'bold'
  },
  likeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 10,
    marginBottom: 5
  },
  reviewImg: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 5,
    position: 'absolute',
    bottom: 0,
    right: 0
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'rgba(0, 0, 0,0.75)',
    padding: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  closeModal: {
    position: 'absolute',
    right: 40,
    top: 5
  },
  closeModalBtn: {
    fontWeight: 'bold',
    color: 'red',
    fontSize: 25,
    opacity: 1
  },
  imgThumb: {
    width: 100,
    height: 75,
    borderWidth: 1,
    borderColor: 'black'
  },
  imgFull: {
    width: 350,
    height: 350,
    borderWidth: 1,
    borderColor: 'black'
  }
})

export default Details

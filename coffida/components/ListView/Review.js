import React, { Component } from 'react'
import { Text, TextInput, View, Button, FlatList, ScrollView, TouchableOpacity, ToastAndroid, Image, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

const starBlank = '../../resources/img/star_rating_blank.png'
const starActive = '../../resources/img/star_rating_active.png'

class Review extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLoading: true,
      locationId: this.props.route.params.locationId,
      locationName: this.props.route.params.locationName,
      min_rating: 0,
      max_rating: 5,
      overall_rating: 0,
      price_rating: 0,
      quality_rating: 0,
      clenliness_rating: 0,
      review_body: ''
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

  submitReview = async () => {
    const navigation = this.props.navigation

    //Validation TO DO
    if (this.state.price_rating == 0){
      ToastAndroid.show("Please Enter Email Address", ToastAndroid.SHORT);
      return
    }

    if (this.state.review_body == ''){
      ToastAndroid.show("Please Enter Review", ToastAndroid.SHORT);
      return
    }

    return fetch("http://10.0.2.2:3333/api/1.0.0/location/" + this.state.locationId + "/review", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('@session_token')
      },
      body: JSON.stringify(this.state)
    })
    .then((response) => {
      if(response.status === 201){
        return
      } else if (response.status === 400) {
        throw "Invalid Email Or Password";
      } else {
        throw "Something went wrong. Please try again";
      }
    })
    .then(() => {
      navigation.goBack()
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
 
    for( var i = 1; i <= this.state.max_rating; i++ )
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

  render () {

    return (
      <ScrollView>
        <View>
          <View>
            <Text>Review For {this.state.locationName}</Text>
          </View>
          <View>
            <Text>Price Rating:</Text>
              <View style={styles.ratingRow}>{this.renderRating('price_rating')}</View>
          </View>
          <View>
            <Text>Quality Rating:</Text>
              <View style={styles.ratingRow}>{this.renderRating('quality_rating')}</View>
          </View>
          <View>
            <Text>Cleanliness Rating:</Text>
              <View style={styles.ratingRow}>{this.renderRating('clenliness_rating')}</View>
          </View>
          <View>
            <Text>Overall Rating:</Text>
              <View style={styles.ratingRow}>{this.renderRating('overall_rating')}</View>
          </View>
          <View>
            <Text>Review:</Text>
            <TextInput
              placeholder="Review Details..."
              onChangeText={(review_body) => this.setState({review_body})}
              value={this.state.review_body}
              multiline={true}
              numberOfLines={4} />
          </View>
          <View>
            <TouchableOpacity onPress={() => this.submitReview()}>
              <Text>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
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
  }
})


export default Review
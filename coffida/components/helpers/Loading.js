import React, { Component } from 'react'
import { View, ActivityIndicator } from 'react-native'

import GlobalStyles from './Style'

class Loading extends Component {
  render () {
    return (
      <View style={GlobalStyles.loadingScrollContainer}>
        <View style={GlobalStyles.loadingHeaderView}>
          <ActivityIndicator
            animating
            style={GlobalStyles.loadingHeader}
            color='#ffffff'
            size='large'
          />
        </View>
      </View>
    )
  }
}

export default Loading

import React, { Component } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'

class Loading extends Component {
  render () {
    return (
      <View style={styles.loadingScrollContainer}>
        <View style={styles.loadingHeaderView}>
          <ActivityIndicator
            animating
            style={styles.loadingHeader}
            color='#ffffff'
            size='large'
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  loadingScrollContainer: {
    backgroundColor: '#FFA5AD',
    flexDirection: 'column',
    flex: 1
  },
  loadingHeaderView: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1
  },
  loadingHeader: {
    opacity: 1
  }
})

export default Loading

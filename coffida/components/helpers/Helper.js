import { PermissionsAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

class Helper {
  // function to retrieve distance between 2 points (as the crow flies)
  calculateDistance(startLat, startLng, endLat, endLng) {
    if (startLat == null || startLng == null) {
      return 0
    }

    const p = 0.017453292519943295 // Math.PI / 180
    const c = Math.cos
    const a = 0.5 - c((endLat - startLat) * p) / 2 +
      c(startLat * p) * c(endLat * p) *
      (1 - c((endLng - startLng) * p)) / 2

    return (12742 * Math.asin(Math.sqrt(a))).toFixed(2) // 2 * R; R = 6371 Radius of earth in km
  }

  getUserDetails = async () => {

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
      if(response.status === 200) {
        return response.json()
      } else if (response.status === 401) {
        return 'Login'
      } else {
        return 'Error'
      }
    })
  }

  getLocations = async () => {

    return fetch('http://10.0.2.2:3333/api/1.0.0/find', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('@session_token')
      }
    })
    .then((response) => {
      if(response.status === 200) {
        return response.json()
      } else if (response.status === 401) {
        return 'Login'
      } else {
        return 'Error'
      }
    })

  }

  requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app requires access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can access location')
        return true
      } else {
        console.log('Location permission denied')
        return false
      }
    } catch (err) {
      console.warn(err)
    }
  }

  sortList(responseJson, sortBy) {
    var data = responseJson
    data = data.sort(this.sortBy(sortBy))
    return data
  }

  sortBy(prop) {
    return function(a,b) {
       if (a[prop] < b[prop]) {
          return 1
       } else if(a[prop] > b[prop]) {
          return -1
       }
       return 0
    }
  }
}

const helper = new Helper()
export default helper

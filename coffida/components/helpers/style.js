import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#FFA5AD',
    flexDirection: 'column',
    flex: 1
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
  inputContainer: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center'
  },
  locationName: {
    fontSize: 20,
    color: 'red',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
    flex: 3
  },
  locationDistance: {
    color: 'red',
    flex: 1,
    paddingTop: 10,
    fontFamily: 'Courier New',
    fontWeight: 'bold'
  },
  locationTown: {
    color: 'black',
    flex: 1,
    paddingTop: 5,
    fontFamily: 'Courier New Bold'
  }
})
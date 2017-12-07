import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import {View, Text, StyleSheet} from 'react-native';

export default class Edit extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>
          编辑页面
        </Text>
      </View>
    )
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: '#f5fcff'
  }
})
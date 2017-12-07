/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

import List from './app/creation'
import Edit from './app/edit'
import Account from './app/account'
import Login from './app/account/login'

import {
  TabBarIOS,
  StyleSheet,
  AsyncStorage,
  NavigatorIOS
} from 'react-native';

export default class App extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      selectedTab: 'blueTab',
      logined: false
    }
    this._asyncAppState = this._asyncAppState.bind(this)
    this._afterLogin = this._afterLogin.bind(this)
    this._logout = this._logout.bind(this)
  }
  componentDidMount() {
    this._asyncAppState()
  }
  _asyncAppState() {
    const that = this
    AsyncStorage.getItem('user')
      .then(data => {
        let user
        let newState = {}
        if (data) {
          user = JSON.parse(data)
        }
        if (user && user.accessToken) {
          newState.user = user
          newState.logined = true
        } else {
          newState.logined = false
        }
        that.setState(newState)
      })
  }
  _afterLogin(data) {
    const that = this
    let user = JSON.stringify(data)
    AsyncStorage.setItem('user', user)
      .then(() => {
        that.setState({
          logined: true,
          user: user
        })
      })
  }
  _logout() {
    AsyncStorage.removeItem('user')
    this.setState({
      logined: false,
      user: null
    })
  }
  render() {
    if (!this.state.logined) {
      return <Login afterLogin={this._afterLogin}/>
    }
    return (
      <TabBarIOS
        unselectedTintColor="yellow"
        tintColor="#ee735c"
        barTintColor="darkslateblue">
        <Icon.TabBarItem
          iconName='ios-videocam'
          selectedIconName='ios-videocam-outline'
          selected={this.state.selectedTab === 'blueTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'blueTab',
            })
          }}>
          <NavigatorIOS
            initialRoute={{
              component: List,
              title: '列表页面',
              passProps: {}
            }}
            style={{flex:1}}
          />
          {/*<List/>*/}
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-recording'
          selectedIconName='ios-recording-outline'
          selected={this.state.selectedTab === 'redTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'redTab',
              notifCount: this.state.notifCount + 1,
            });
          }}>
          <Edit/>
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-more'
          selectedIconName='ios-more-outline'
          selected={this.state.selectedTab === 'greenTab'}
          onPress={() => {
            this.setState({
              selectedTab: 'greenTab',
              presses: this.state.presses + 1
            });
          }}>
          <Account logout={this._logout} user={this.state.user}/>
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
}
var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
});

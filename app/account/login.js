'use strict'
import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import {View, Text, StyleSheet, AsyncStorage, TextInput, AlertIOS} from 'react-native'
import Btn from 'react-native-button'
// import { CountDown } from 'react-native-sk-countdown'
// const {CountDownText} = require('react-native-sk-countdown')

import request from '../common/request'
import config from '../common/config'

export default class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      phoneNumber:'',
      codeSend: false,
      countingDone: false,
      verifyCode: false
    }
    this._sendVerifyCode = this._sendVerifyCode.bind(this)
    this._countingDone = this._countingDone.bind(this)
    this._showVerifyCode = this._showVerifyCode.bind(this)
    this._submit = this._submit.bind(this)
    // this._afterLogin = this._afterLogin.bind(this)

  }
  componentDidMount() {}
  _showVerifyCode() {
    this.setState({
      codeSend: true
    })
  }
  _sendVerifyCode() {
    let phoneNumber = this.state.phoneNumber
    if (!phoneNumber) {
      return AlertIOS.alert('手机号不能为空')
    }
    let body = {
      phoneNumber
    }
    let signupURL = config.api.base + config.api.signup
    request.post(signupURL, body)
      .then(data => {
        if (data.success) {
          this._showVerifyCode()
        } else {
          AlertIOS.alert('获取验证码失败，请检查手机号码是否正确')
        }
      })
      .catch(err => {
        console.log('错误日志post')
        console.log(err)
      })
  }
  _countingDone() {
    this.setState({
      countingDone:true
    })
  }
  _submit() {
    let that = this
    let phoneNumber = this.state.phoneNumber
    let verifyCode = this.state.verifyCode

    if (!phoneNumber || !verifyCode) {
      return AlertIOS.alert('手机号或者验证码不能为空！')
    }
    let body = {
      phoneNumber,
      verifyCode
    }
    let verifyURL = config.api.base + config.api.verify
    request.post(verifyURL, body)
      .then(data => {
        if (data.success) {
          console.log('登录成功')
          // console.log(data.data)
          that.props.afterLogin(data.data)
        } else {
          AlertIOS.alert('获取验证码失败，请检查手机号码是否正确')
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>快速登录</Text>
          <TextInput style={styles.inputField}
                     placeholder='请输入手机号'
                     autoCaptialize={'none'}
                     autoCorrect={false}
                     keyboradType={'number-pad'}
                     onChangeText={(text) => {
                       this.setState({
                         phoneNumber: text
                       })
                     }}
          />
          { this.state.codeSend
            ? <View style={styles.verifyCodeBox}>
                <TextInput style={styles.inputField}
                         placeholder='输入验证码'
                         autoCaptialize={'none'}
                         autoCorrect={false}
                         keyboardType={'number-pad'}
                         onChangeText={(text) => {
                           this.setState({
                             verifyCode: text
                           })
                         }}/>
                { this.state.countingDone
                  ? <Btn style={styles.countBtn} onPress={() => this._sendVerifyCode()}>获取验证码</Btn>
                  : null
                  // : <CountDownText // 倒计时
                  //     style={styles.countBtn}
                  //     countType='seconds' // 计时类型：seconds / date
                  //     auto={true} // 自动开始
                  //     afterEnd={this._countingDone} // 结束回调
                  //     timeLeft={60} // 正向计时 时间起点为0秒
                  //     step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                  //     startText='获取验证码' // 开始的文本
                  //     endText='获取验证码' // 结束的文本
                  //     intervalText={(sec) => '剩余秒数：' + sec} />
                }
            </View>
            : null
          }
          { this.state.codeSend
            ? <Btn style={styles.btn} onPress={this._submit} color='#ee753c'>登录</Btn>
            : <Btn style={styles.btn} onPress={this._sendVerifyCode}>获取验证码</Btn>
          }
        </View>
      </View>
    )
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9'
  },
  signupBox: {
    marginTop: 30,
    flex: 1
  },
  title: {
    marginBottom: 20,
    color: '#333',
    fontSize: 20,
    textAlign:'center'
  },
  inputField: {
    height: 40,
    padding: 5,
    color: '#666',
    fontSize: 16,
    backgroundColor:'#fff',
    borderRadius: 4
  },
  btn: {
    padding: 10,
    marginTop:10,
    backgroundColor: 'transparent',
    borderWidth:1,
    borderColor: '#ee735c',
    color: '#ee735c',
    borderRadius:4
  },
  verifyCodeBox: {
    marginTop:10,
    flexDirection:'row',
    justifyContent:'space-between',
  },
  countBtn: {
    width: 110,
    height:40,
    marginLeft:8,
    padding: 10,
    color: '#fff',
    backgroundColor:'#ee735c',
    borderColor: '#ee735c',
    textAlign:'left',
    fontWeight: '600',
    fontSize: 15,
    borderRadius: 2
  }
})
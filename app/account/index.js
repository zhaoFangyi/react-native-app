import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import {View, Text, StyleSheet, AsyncStorage, TouchableOpacity,
        Dimensions, Image, AlertIOS, Modal, TextInput} from 'react-native'
import ImagePicker from 'react-native-image-picker'
import * as Progress from 'react-native-progress'
import Btn from 'react-native-button'
import sha1 from 'sha1'
import uuid from 'uuid'

const width = Dimensions.get('window').width
import request from '../common/request'
import config from '../common/config'

let photoOptions = {
  title: '选择头像',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle: '拍照',
  chooseFromLibraryButtonTitle: '选择相册',
  quality: 0.75,
  allowsEditing: true,
  noData: false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}
function avatar(id, type) {
  if (id.indexOf('http') > -1) {
    return id
  }
  if (id.indexOf('data:image') > -1) {
    return id
  }
  return config.cloudinary.base + '/' + type + '/upload/' + id
}
export default class Account extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user || {},
      avatarProgress: 0,
      avatarUploading: false,
      modalVisible: false
    }
    this._pickPhoto = this._pickPhoto.bind(this)
    this._upload = this._upload.bind(this)
    this._asyncUser = this._asyncUser.bind(this)
    this._edit = this._edit.bind(this)
    this._closeModal = this._closeModal.bind(this)
    this._changeUserState = this._changeUserState.bind(this)
    this._submit = this._submit.bind(this)
    this._logout = this._logout.bind(this)
    this.getQiniuToken = this.getQiniuToken.bind(this)
    // this._logout = this._logout.bind(this)
    // this._logout = this._logout.bind(this)

  }
  componentDidMount() {
    const that = this
    AsyncStorage.getItem('user')
      .then(data => {
        let user
        if (data) {
          user = JSON.parse(data)
        }
        if (user && user.accessToken) {
          that.setState({
            user
          })
        }
      })
  }
  getQiniuToken(accessToken, key) {
    let signatureURL = config.apiTest.base+ config.apiTest.signature
    console.log(signatureURL)
    console.log(accessToken)
    console.log(key)
    return request.post(signatureURL, {
      accessToken,
      key
    })
      .catch(err => {
        console.log(err)
      })
  }
  _pickPhoto() {
    const that = this
    ImagePicker.showImagePicker(photoOptions, (res) => {
      if (res.didCancel) {
        console.log('User cancelled image picker')
      }
      let avatarData = 'data:image/jpeg;base64,' + res.data
      let accessToken = that.state.user.accessToken
      let key = uuid.v4() + '.jpeg'
      let uri = res.uri

      that.getQiniuToken(accessToken, key)
      .then(data => {
        console.log(data)
        if (data && data.success) {
          let token = data.data
          
          let body = new FormData()
          body.append('token', token)
          body.append('key', key)
          body.append('file', {
            type: 'image/png',
            uri,
            name: key
          })
          that._upload(body)
        }
      })
    })
  }
  _upload(body) {
    console.log('upload')
    console.log(body)
    const that = this
    let xhr = new XMLHttpRequest()
    let url = config.qiniu.upload
    that.setState({
      avatarUploading:true,
      avatarProgress: 0
    })
    xhr.open('POST', url)
    xhr.onload = () => {
      if (xhr.status !== 200) {
        AlertIOS.alert('请求失败')
        console.log(xhr.responseText)
        return
      }
      if (!xhr.responseText) {
        AlertIOS.alert('请求失败')
        return
      }
      let response
      try {
        response = JSON.parse(xhr.response)
        console.log(response)
      }
      catch (e) {
        console.log(e)
        console.log('parse fails')
      }
      if (response && response.public_id) {
        let user = this.state.user
        user.avatar = response.public_id
        console.log(user)
        that.setState({
          avatarUploading: false,
          avatarProgress: 0,
          user
        })
        that._asyncUser(true)
      }
    }
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          let percent = Number((event.loaded / event.total).toFixed(2))
          that.setState({
            avatarProgress: percent
          })
        }
      }
    }
    xhr.send(body)
  }
  _asyncUser(isAvatar) {
    const that = this
    const user  = this.state.user
    if (user && user.accessToken) {
      let url = config.api.base + config.api.update
      request.post(url, user)
        .then(data => {
          // console.log(data)
          if (data && data.success) {
            let user = data.data
            if (isAvatar) {
              AlertIOS.alert('头像更新成功')
            }
            that.setState({
              user
            }, () => {
              that._closeModal()
              AsyncStorage.setItem('user', JSON.stringify(user))
            })

          }
        })
    }
  }
  _edit() {
    this.setState({
      modalVisible:true
    })
  }
  _closeModal() {
    this.setState({
      modalVisible: false
    })
  }
  _changeUserState(key, value) {
    const that = this
    let user = this.state.user
    user[key] = value
    that.setState({
      user
    })
  }
  _submit() {
    this._asyncUser()
  }
  _logout() {
    this.props.logout()
  }
  render() {
    let user = this.state.user
    // console.log(user)
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>狗狗账户</Text>
          <Text style={styles.toolbarExtra} onPress={this._edit}>编辑</Text>
        </View>
        {
          user.avatar
          ? <TouchableOpacity style={styles.avatarContainer} onPress={this._pickPhoto}>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading
                    ? <Progress.Circle size={40}
                                       showsText={true}
                                       color='#ee735c'
                                       progress={this.state.avatarProgress}/>
                    : <Image source={{uri: avatar(user.avatar, 'image')}} style={styles.avatar}/>
                }
              </View>
              <Text style={styles.avatarTip}>戳这里换头像</Text>
            </TouchableOpacity>
          :  <TouchableOpacity style={styles.avatarContainer} onPress={this._pickPhoto}>
              <Text style={styles.avatarTip}>添加狗狗头像</Text>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading
                  ? <Progress.Circle size={40}
                                     showsText={true}
                                     color='#ee735c'
                                     progress={this.state.avatarProgress}/>
                    : <Icon size={48} name='ios-add' style={styles.plusIcon}/>
                }
              </View>
            </TouchableOpacity>
        }
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {alert("Modal has been closed.")}}
        >
          <View style={styles.modalContainer}>
            <Icon name='ios-close-outline' style={styles.closeIcon} onPress={this._closeModal}/>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput placeholder='输入你的昵称'
                         style={styles.inputField}
                         autoCapitalize='none'
                         value={user.nickname}
                         onChangeText={(content) => {
                           this._changeUserState('nickname', content)
                           }} />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>品种</Text>
              <TextInput placeholder='狗狗的品种'
                         style={styles.inputField}
                         autoCapitalize='none'
                         value={user.bread}
                         onChangeText={(content) => {
                           this._changeUserState('bread', content)
                         }} />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput placeholder='狗狗的年龄'
                         style={styles.inputField}
                         autoCapitalize='none'
                         value={user.age}
                         onChangeText={(content) => {
                           this._changeUserState('age', content)
                         }} />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Icon.Button
                onPress={() => {this._changeUserState('gender', 'male')}}
                style={[styles.gender, user.gender === 'male' && styles.genderChecked]}
                name='ios-male'>男</Icon.Button>
              <Icon.Button
                onPress={() => {this._changeUserState('gender', 'female')}}
                style={[styles.gender, user.gender === 'female' && styles.genderChecked]}
                name='ios-female'>女</Icon.Button>
            </View>

            <Btn style={styles.btn} onPress={this._submit} color='#ee753c'>保存资料</Btn>
          </View>
        </Modal>
        <Btn style={styles.btn} onPress={this._logout} color='#ee753c'>退出登录</Btn>
      </View>
    )
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toolbar: {
    flexDirection:'row',
    paddingTop:25,
    paddingBottom:12,
    backgroundColor: '#ee735c'
  },
  toolbarTitle: {
    flex:1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight:'600'
  },
  toolbarExtra: {
    position:'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign:'right',
    fontWeight:'600',
    fontSize: 14
  },
  avatarContainer: {
    width: width,
    height: 150,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#eee'
  },
  avatarBox: {
    marginTop:15,
    alignItems:'center',
    justifyContent:'center'
  },
  avatar: {
    marginTop:15,
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'cover',
    borderRadius: width * 0.1
  },
  avatarTip: {
    marginTop: 10
  },
  plusIcon: {
    padding: 20,
    paddingLeft:25,
    paddingRight:25,
    color:'#999',
    fontSize:24,
    backgroundColor:'#fff',
    borderRadius: 8
  },
  modalContainer: {
    flex: 1,
    paddingTop:50,
    backgroundColor: '#fff'
  },
  fieldItem: {
    flexDirection:'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingLeft:15,
    paddingRight:15,
    borderBottomColor: '#eee',
    borderBottomWidth:1
  },
  label: {
    color:'#ccc',
    marginRight:10,
  },
  inputField:{
    height: 49,
    flex:1,
    color: '#666',
    fontSize: 14
  },
  closeIcon: {
    width: 40,
    height: 40,
    fontSize:32,
    position:'absolute',
    right:20,
    top: 30,
    color: '#ee735c'
  },
  gender: {
    backgroundColor: '#ccc'
  },
  genderChecked: {
    backgroundColor: '#ee735c'
  },
  btn: {
    padding: 10,
    marginTop:25,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'transparent',
    borderWidth:1,
    borderColor: '#ee735c',
    color: '#ee735c',
    borderRadius:4
  }
})
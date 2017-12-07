import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import {
  View, Text, StyleSheet, Dimensions, ActivityIndicator,
  TouchableOpacity, Image, FlatList, TextInput, Modal, AlertIOS
} from 'react-native'
import Video from 'react-native-video'
import Button from 'react-native-button'

import request from '../common/request'
import config from '../common/config'

const width = Dimensions.get('window').width

let cachedResults = {
  nextPage: 1,
  items: [],
  total: 0
}


export default class Detail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data,
      // video
      rate: 1,
      muted: true,
      resizeMode: 'contain',
      repeat: false,
      videoLoaded: false,
      paused: false,
      // progress
      videoProgress: 0.01,
      videoTotal: 0,
      currentTime: 0,
      playing: false,
      videoOk: true,
      // 评论列表
      comments: [],
      content: '',
      // 下拉加载更多
      isLoadingTail: false,
      // modal
      animationType: 'none',
      modalVisible: false,
      isSending: false
    }
    this._onProgress = this._onProgress.bind(this)
    this._pause = this._pause.bind(this)
    this._resume = this._resume.bind(this)
    this._rePlay = this._rePlay.bind(this)
    this._onEnd = this._onEnd.bind(this)
    this._onError = this._onError.bind(this)

    this._fetchData = this._fetchData.bind(this)
    this._renderRow = this._renderRow.bind(this)
    this._hasMore = this._hasMore.bind(this)
    this._fetchMoreData = this._fetchMoreData.bind(this)
    this._renderFooter = this._renderFooter.bind(this)
    this._renderHeader = this._renderHeader.bind(this)
    this._focus = this._focus.bind(this)
    this._setModalVisible = this._setModalVisible.bind(this)
    this._closeModal = this._closeModal.bind(this)
    this._submit = this._submit.bind(this)
    // this._submit = this._submit.bind(this)
    // this._submit = this._submit.bind(this)
    // this._submit = this._submit.bind(this)


  }
  componentDidMount() {
    this._fetchData(1)
  }
  _fetchData(page) {
    const ctx = this
    ctx.setState({
      isLoadingTail: true
    })
    request.get(config.api.base + config.api.comment, {
      accessToken: 'zhaofy',
      creation: 1245,
      page: page
    })
      .then(data => {
        if (data.success) {
          let items = cachedResults.items.slice()

          items = data.data.concat(items)
          cachedResults.items = items
          cachedResults.total = data.total

          ctx.setState({
            isLoadingTail: false,
            comments: cachedResults.items
          })
        }
      })
      .catch((error) => {
        ctx.setState({
          isLoadingTail: false
        })
        console.error(error)
      })
  }
  _keyExtractor(item) {
    return item._id
  }
  _hasMore() {
    return cachedResults.items.length !== cachedResults.total
  }
  _fetchMoreData() {
    if (!this._hasMore() || this.state.isLoadingTail) {
      return
    }
    let page = cachedResults.nextPage
    this._fetchData(page)
  }
  _renderFooter() {
    if (!this._hasMore() && cachedResults.total !== 0) {
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>没有更多数据了</Text>
        </View>
      )
    }
    if (!this.state.isLoadingTail) {
      return <View style={styles.loadingMore}/>
    }
    return <ActivityIndicator style={styles.loadingMore}/>
  }
  _renderHeader() {
    var data = this.state.data
    console.log(data)
    return (
      <View style={styles.listHeader}>
        <View style={styles.infoBox}>
          <Image style={styles.avatar} source={{uri: data.author.avatar}}/>
          <View style={styles.descBox}>
            <Text style={styles.nickname}>{data.author.nickname}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <View style={styles.comment}>
            <TextInput placeholder='好喜欢这个狗狗啊。。。'
                       style={styles.content}
                       multiline={true} onFocus={this._focus}/>
          </View>
        </View>
        <View style={styles.commentArea}>
          <Text style={styles.commentTitle}>精彩评论</Text>
        </View>
      </View>
    )
  }
  _focus() {
    this._setModalVisible(true)
  }
  _blur() {

  }
  _closeModal() {
    this._setModalVisible(false)
  }
  _setModalVisible(isVisible) {
    this.setState({
      modalVisible: isVisible
    })
  }
  _onLoadStart() {
  }

  _onLoad() {
  }

  _onProgress(data) {
    // 视频未加载
    if (!this.state.videoLoaded) {
      this.setState({
        videoLoaded: true
      })
    }
    let duration = data.playableDuration
    let currentTime = data.currentTime
    let percent = Number((currentTime / duration).toFixed(2))
    let newState = {
      videoTotal: duration,
      currentTime: Number(data.currentTime.toFixed(2)),
      videoProgress: percent
    }
    if (!this.state.videoLoaded) {
      newState.videoLoaded = true
    }
    if (!this.state.playing) {
      newState.playing = true
    }
    this.setState(newState)
  }

  _onEnd() {
    this.setState({
      videoProgress: 1,
      playing: false
    })
  }

  _onError() {
    this.setState({
      videoOk: false
    })
  }

  _rePlay() {
    this.refs.videoPlayer.seek(0)
  }

  _pause() {
    if (!this.state.paused) {
      this.setState({
        paused: true
      })
    }
  }

  _resume() {
    if (this.state.paused) {
      this.setState({
        paused: false
      })
    }
  }

  _pop() {
    this.props.navigator.pop()
  }
  _keyExtractor(item) {
    return item._id
  }
  _renderRow(row) {
    return (
      <View style={styles.replyBox}>
        <Image source={{uri: row.item.replyBy.avatar}} style={styles.replyAvatar}/>
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{row.item.replyBy.nickname}</Text>
          <Text style={styles.replyContent}>{row.item.content}</Text>
        </View>
      </View>
    )
  }
  _submit() {
    const ctx = this
    if (!ctx.state.content) {
      return AlertIOS.alert('留言不能为空')
    }
    if (ctx.state.isSending) {
      return AlertIOS.alert('正在评论中。。。')
    }
    ctx.setState({
      isSending:true
    }, () => {
      let body = {
        accessToken:'zhaofy',
        creation: '1246',
        content: this.state.content
      }
      let url = config.api.base + config.api.postComment
      request.post(url, body)
        .then(data => {
          if (data && data.success) {
            let items = cachedResults.items.slice()
            let content = ctx.state.content
            items = [{
              _id: '12478745',
              content: content,
              replyBy: {
                nickname: '狗狗说',
                avatar: 'http://dummyimage.com/640x640/79baf2'
              }}].concat(items)
            cachedResults.items = items
            cachedResults.total = cachedResults.total + 1
            ctx.setState({
              content: '',
              isSending: false,
              comments: cachedResults.items
            })
            ctx._setModalVisible(false)
          }
        })
        .catch(err => {
          ctx.setState({
            isSending: false
          })
          ctx._setModalVisible(false)
          console.log(err)
        })
    })
  }
  render() {
    let data = this.props.data
    return (
      <View style={styles.container}>
        {/*<View style={styles.header}>*/}
        {/*<TouchableOpacity style={styles.backBox} onPress={this._pop}>*/}
        {/*<Icon name='chevron-left' style={styles.backIcon} />*/}
        {/*<Text style={styles.backText}>返回</Text>*/}
        {/*</TouchableOpacity>*/}
        {/*<Text style={styles.headerTitle} numberOflines={1}>*/}
        {/*视频详情页*/}
        {/*</Text>*/}
        {/*</View>*/}
        {/*<Text>*/}
          {/*详情页面*/}
        {/*</Text>*/}
        <View style={styles.videoBox}>
          <Video ref='videoPlayer'
                 source={{uri: data.video}}
                 style={styles.video}
                 volume={5}
                 paused={this.state.paused}
                 rate={this.state.rate}
                 muted={this.state.muted}
                 resizeMode={this.state.resizeMode}
                 repeat={this.state.repeat}
                 onLoadStart={this._onLoadStart}
                 onLoad={this._onLoad}
                 onProgress={this._onProgress}
                 onEnd={this._onEnd}
                 onError={this._onError}/>
          {!this.state.videoOk && <Text style={styles.failText}>视频出错了！很抱歉</Text>}
          {!this.state.videoLoaded && <ActivityIndicator
            color='#ee735c' style={styles.loading}/>}

          {this.state.videoLoaded && !this.state.playing ? <Icon
            onPress={this._rePlay} size={48} name='ios-play' style={styles.playIcon}/> : null}

          {this.state.videoLoaded && this.state.playing ?
            <TouchableOpacity onPress={this._pause} style={styles.pauseBtn}>
              {
                this.state.paused
                  ? <Icon onPress={this._resume} name='ios-play' size={48} style={styles.resumeIcon}/>
                  : <Text></Text>
              }
            </TouchableOpacity> : null}

          <View style={styles.progressBox}>
            <View style={[styles.progressBar, {width: width * this.state.videoProgress}]}/>
          </View>
        </View>
        <FlatList
          data={this.state.comments}
          renderItem={this._renderRow}
          keyExtractor={this._keyExtractor}
          automaticallyAdjustContentInsets={false}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={.5}
          ListFooterComponent={this._renderFooter}
          ListHeaderComponent={this._renderHeader}
        />
        <Modal animationType={'fade'}
               visible={this.state.modalVisible}
               onRequestClose={() => {this._setModalVisible(false)}}>
          <View style={styles.modalContainer}>
            <Icon onPress={this._closeModal}
                  name='ios-close-outline' style={styles.closeIcon}/>
            <View style={styles.commentBox}>
              <View style={styles.comment}>
                <TextInput placeholder='好喜欢这个狗狗啊。。。'
                           style={styles.content}
                           multiline={true}
                           value={this.state.content}
                           onChangeText={(content) => {
                             console.log(content)
                             this.setState({
                               content
                             })
                }}/>
              </View>
            </View>
            <Button style={styles.submit} onPress={this._submit}>评论</Button>
          </View>
        </Modal>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: '#fff'
  },
  closeIcon: {
    alignSelf:'center',
    fontSize: 30,
    color: '#ee753c'
  },
  container: {
    flex: 1,
    backgroundColor: '#f5fcff'
  },
  submit: {
    width: width -20,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ee753c',
    borderRadius: 4,
    fontSize: 18,
    color: '#ee753c'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: 64,
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff'
  },
  backBox: {
    position: 'absolute',
    left: 12,
    top: 32,
    width: 50,
    flexDirection: 'row',
    alignItems: 'center'

  },
  headerTitle: {
    width: width - 120,
    textAlign: 'center'
  },
  backIcon: {
    color: '#999',
    fontSize: 20,
    marginRight: 5
  },
  backText: {
    color: '#999'
  },
  videoBox: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000'
  },
  video: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000'
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 80,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },
  progressBox: {
    width: width,
    height: 2,
    backgroundColor: '#ccc'
  },
  progressBar: {
    width: 1,
    height: 2,
    backgroundColor: '#ff6600'
  },
  playIcon: {
    position: 'absolute',
    top: 90,
    left: width / 2 -30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },
  pauseBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width,
    height: 360
  },
  resumeIcon: {
    position: 'absolute',
    top: 140,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },
  failText: {
    position: 'absolute',
    left: 0,
    top: 180,
    width: width,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  scrollView: {
    width: width,
    height: 300,
    flex: 1
  },
  infoBox: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight:10,
    marginLeft: 10,
    borderRadius: 30
  },
  descBox: {
    flex: 1
  },
  nickname: {
    fontSize: 18
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    color: '#666'
  },
  replyBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  replyAvatar: {
    width: 40,
    height: 40,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 20
  },
  replyNickname: {
    color: '#666',
  },
  replyContent: {
    marginTop: 4,
    color: '#666'
  },
  reply: {
    flex: 1
  },
  testBox: {
    backgroundColor: 'yellow'
  },
  testContent: {
    color: '#000'
  },
  loadingMore: {
    marginVertical: 20
  },
  loadingText: {
    color: '#777',
    textAlign: 'center'
  },
  listHeader: {
    marginTop: 10,
    width: width
  },
  commentBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    width: width
  },
  content: {
    paddingLeft: 2,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 14,
    height: 80
  },
  commentArea: {
    width: width,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight:10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
})
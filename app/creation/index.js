import React, {Component} from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import {View, Text, ActivityIndicator, RefreshControl, AlertIOS,
  StyleSheet, FlatList, TouchableHighlight, Dimensions, Image} from 'react-native'
import Detail from './detail'

import request from '../common/request'
import config from '../common/config'

const width = Dimensions.get('window').width

let cachedResults = {
  nextPage: 1,
  items: [],
  total: 0
}
class Item extends Component {
  constructor(props) {
    super(props)
    this.state = {
      row: this.props.row,
      up: this.props.row.voted
    }
    this._up = this._up.bind(this)
  }
  _up() {
    const ctx = this
    let up = !this.state.up
    let row = this.state.row
    let url = config.api.base + config.api.up
    let body = {
      id: row._id,
      up: up ? 'yes' : 'no',
      accessToken: 'absfg'
    }
    request.post(url, body)
      .then(data => {
        if (data && data.success) {
          ctx.setState({
            up
          })
        } else {
          AlertIOS.alert('点赞失败，稍后重试')
        }
      })
      .catch(err => {
        AlertIOS.alert('点赞失败，稍后重试')
      })
  }
  render() {
    let row = this.state.row
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <View>
            <Image source={{uri: row.thumb}} style={styles.thumb}/>
            <Icon name='ios-play' size={28} style={styles.play}/>
          </View>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon name={this.state.up ? 'ios-heart': 'ios-heart-outline'}
                    size={28}
                    onPress={this._up}
                    style={[styles.up, this.state.up ? null : styles.down]}/>
              <Text style={styles.handleText}
                    onPress={this._up}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon name='ios-chatboxes-outline' size={28} style={styles.commonIcon}/>
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

export default class List extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dataSource: [],
      isLoadingTail: false,
      isRefreshing: false
    }
    this._renderRow = this._renderRow.bind(this)
    this._fetchData = this._fetchData.bind(this)
    this._fetchMoreData = this._fetchMoreData.bind(this)
    this._hasMore = this._hasMore.bind(this)
    this._renderFooter = this._renderFooter.bind(this)
    this._keyExtractor = this._keyExtractor.bind(this)
    this._onRefresh = this._onRefresh.bind(this)
    this._loadPage = this._loadPage.bind(this)
    // this._onRefresh = this._onRefresh.bind(this)
    // this._onRefresh = this._onRefresh.bind(this)

  }
  _renderRow({item}) {
    return (
     <Item row={item} onSelect={() => this._loadPage(item)} key={item._id}/>
    )
  }
  componentDidMount() {
    this._fetchData(1)
  }
  _fetchData(page) {
    const ctx = this
    if (page !== 0) {
      ctx.setState({
        isLoadingTail: true
      })
    } else {
      ctx.setState({
        isRefreshing: true
      })
    }
    request.get(config.api.base + config.api.creations, {
      accessToken: 'absfg',
      page: page
    })
      .then(data => {
        if (data.success) {
          let items = cachedResults.items.slice()

          if (page !== 0) {
            items = items.concat(data.data)
            cachedResults.nextPage ++
          } else {
            items = data.data.concat(items)
          }
          cachedResults.items = items
          cachedResults.total = data.total

          if (page !== 0) {
            ctx.setState({
              isLoadingTail: false,
              dataSource: cachedResults.items
            })
          } else {
            ctx.setState({
              isRefreshing: false,
              dataSource: cachedResults.items
            })
          }
        }
      })
      .catch((error) => {
        if (page !== 0) {
          ctx.setState({
            isLoadingTail: false
          })
        } else {
          ctx.setState({
            isRefreshing: false
          })
        }
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
  _onRefresh() {
    if (!this._hasMore() || this.state.isRefreshing) {
      return
    }
    this._fetchData(0)
  }
  _loadPage(row) {
    this.props.navigator.push({
      component: Detail,
      title: '详情页面',
      passProps: {
        data: row
      }
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            列表页面
          </Text>
        </View>
        <FlatList
          data={this.state.dataSource}
          renderItem={this._renderRow}
          automaticallyAdjustContentInsets={false}
          keyExtractor={this._keyExtractor}
          enableEmptySections={true}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={.5}
          ListFooterComponent={this._renderFooter}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor="#ff6600"
              title='拼命加载中...'
            />
          }
        />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5fcff'
  },
  header: {
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor:'#ee735c'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600'
  },
  item: {
    width: width,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  thumb: {
    width: width,
    height: width * 0.56,
    resizeMode: 'cover'
  },
  title: {
    padding: 10,
    fontSize: 18,
    color: '#333'
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent:'space-between',
    backgroundColor: '#eee'
  },
  handleBox:{
    padding: 10,
    flexDirection: 'row',
    width: width / 2 - 0.5,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  play: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    paddingTop: 9,
    paddingLeft: 18,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth:1,
    borderRadius: 23,
    color:'#ed7b66'
  },
  handleText: {
    paddingLeft:12,
    fontSize: 18,
    color: '#333'
  },
  up: {
    fontSize: 22,
    color:'#ed7b66'
  },
  down: {
    fontSize: 22,
    color: '#333'
  },
  commonIcon: {
    fontSize:22,
    color:'#333'
  },
  test: {
    backgroundColor: 'red'
  },
  test1: {
    backgroundColor: 'black',
    fontSize: 30,
    color: 'red'
  },
  loadingMore: {
    marginVertical: 20
  },
  loadingText: {
    color: '#777',
    textAlign: 'center'
  }
})
'use strict'

import queryString from 'query-string'
import _ from 'lodash'
import Mock from 'mockjs'
import config from './config'

export default {
  get(url, params) {
    if (params) {
      url += '?' + queryString.stringify(params)
    }
    return fetch(url)
      .then(res => res.json())
      .then(res => Mock.mock(res))
  },
  post(url, body) {
    let options = _.extend(config.header, {
      method: 'POST',
      body: JSON.stringify(body)
    })
    return fetch(url, options)
      .then(res => res.json())
      .then(res => Mock.mock(res))
  }
}


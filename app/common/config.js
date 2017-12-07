'use strict'
export default {
  header: {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  },
  qiniu: {
    upload: 'http://upload.qiniu.com'
  },
  cloudinary: {
    cloud_name: 'fangapp',
    api_key: '815976218637227',
    api_secret: 'i3rHuivg_iIiSc6lo81QU_kfd6g',
    base:	'http://res.cloudinary.com/fangapp',
    image: 'https://api.cloudinary.com/v1_1/fangapp/image/upload',
    video: 'https://api.cloudinary.com/v1_1/fangapp/video/upload',
    audio: 'https://api.cloudinary.com/v1_1/fangapp/audio/upload'
  },
  api: {
    base: 'http://rap2api.taobao.org/app/mock/719/',
    creations: 'GET/api/creations',
    up: 'POST/api/up',
    comment: 'GET/api/comments',
    postComment: 'POST/api/comments',
    signup: 'POST/api/u/signup',
    verify: 'POST/api/u/verify',
    signature: 'POST/api/signature',
    update: 'POST/api/u/update'
  },
  apiTest: {
    base: 'http://localhost:3000/',    
    creations: 'api/creations',
    up: 'api/up',
    comment: 'api/comments',
    postComment: 'api/comments',
    signup: 'api/u/signup',
    verify: 'api/u/verify',
    signature: 'api/signature',
    update: 'api/u/update'
  }
}
// 引入封装的jsonp
// import jsonp from '../assets/js/jsonp'
import {
  commonParams
} from './config'
import axios from 'axios'

// 如果是生产阶段那么debug是false  响应的debug调取外部链接数据
const debug = process.env.NODE_ENV !== 'production'

// 发送客户端代理请求获取推荐歌单
export function getDiscList() {
  // 线上环境地址
  const url = debug ? '/api/getDiscList' : 'http://ustbhuangyi.com/music/api/getDiscList'
  // 配置data数据 使用assign函数新增额外数据
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    needNewCode: 0,
    platform: 'yqq',
    sin: 0,
    ein: 29,
    sortId: 5,
    categoryId: 10000000,
    rnd: Math.random(),
    hostUin: 0
  })
  // console.log(data)
  // 发送请求
  return axios.get(url, {
    params: data
  }).then(res => {
    // console.log(res)
    return res.data
  })
}
// 向客户端发送请求,获取推荐歌单数据
export function getCdInfo(disstid) {
  const url = debug ? '/api/getCdInfo' : 'http://ustbhuangyi.com/music/api/getCdInfo'

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

// 发送客户端代理跨域请求 获取轮播图
export function getRecommend() {
  const url = debug ? '/api/getRecommend' : 'http://ustbhuangyi.com/music/api/getTopBanner'
  // 配置请求的信息
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    needNewCode: 0,
    platform: 'yqq.json',
    loginUin: 0,
    hostUin: 0,
    '-': 'recom' + (Math.random() + '').replace('0.', ''),
    data: {
      comm: {
        ct: 24
      },
      category: {
        method: 'get_hot_category',
        param: {
          qq: ''
        },
        module: 'music.web_category_svr'
      },
      recomPlaylist: {
        method: 'get_hot_recommend',
        param: {
          async: 1,
          cmd: 2
        },
        module: 'playlist.HotRecommendServer'
      },
      playlist: {
        method: 'get_playlist_by_category',
        param: {
          id: 8,
          curPage: 1,
          size: 40,
          order: 5,
          titleid: 8
        },
        module: 'playlist.PlayListPlazaServer'
      },
      new_song: {
        module: 'newsong.NewSongServer',
        method: 'get_new_song_info',
        param: {
          type: 5
        }
      },
      new_album: {
        module: 'newalbum.NewAlbumServer',
        method: 'get_new_album_info',
        param: {
          area: 1,
          sin: 0,
          num: 10
        }
      },
      new_album_tag: {
        module: 'newalbum.NewAlbumServer',
        method: 'get_new_album_area',
        param: {}
      },
      toplist: {
        module: 'musicToplist.ToplistInfoServer',
        method: 'GetAll',
        param: {}
      },
      focus: {
        module: 'QQMusic.MusichallServer',
        method: 'GetFocus',
        param: {}
      }
    }
  })
  // 向服务器端发送请求,  服务器端的代理在vue.config.js中进行配置
  return axios.get(url, {
    params: data
  }).then(res => res.data)
}

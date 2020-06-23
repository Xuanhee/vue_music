import {
  commonParams,
  options
} from './config'
// import axios from 'axios'
import jsonp from 'assets/js/jsonp'

// 导出jsonp跨域请求歌手的方法
export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'

  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })

  return jsonp(url, data, options)
}

export function getSingerDetail(singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 80,
    songstatus: 1,
    singermid: singerId
  })

  return jsonp(url, data, options)
}
//   const data = Object.assign({}, commonParams, {
//     g_tk: 5381,
//     loginUin: 0,
//     platform: 'yqq.json',
//     needNewCode: 0,
//     '-': 'getUCGI' + (Math.random() + '').replace('0.', ''),
//     data: {
//       comm: {
//         ct: 20,
//         cv: 0
//       },
//       singerList: {
//         module: 'Music.SingerListServer',
//         method: 'get_singer_list',
//         param: {
//           area: -100,
//           sex: -100,
//           genre: -100,
//           index: -100,
//           sin: 0,
//           cur_page: 1
//         }
//       }
//     }
//   })
//   return axios.get('/api/singerList', {
//     params: data
//   }).then(res => res.data)

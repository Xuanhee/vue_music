import jsonp from 'assets/js/jsonp'
import {
  commonParams,
  options
} from './config'
import axios from 'axios'
const debug = process.env.NODE_ENV !== 'production'
export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })
  return jsonp(url, data, options)
}

export function search(key, page, zhida, perpage) {
  const url = debug ? '/api/search' : 'http://ustbhuangyi.com/music/api/search'
  const data = Object.assign({}, commonParams, {
    w: key,
    p: page,
    perpage,
    n: perpage,
    catZhida: zhida ? 1 : 0,
    zhidaqu: 1,
    is_xml: 0,
    sem: 1,
    flag: 1,
    t: 0,
    cr: 1,
    ie: 'utf-8',
    g_tk: 5381,
    loginUin: 0,
    remoteplace: 'txt.mqq.all',
    platform: 'yqq.json',
    needNewCode: 0
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return res.data
  })
}

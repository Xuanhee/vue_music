/*
 * @Author: your name
 * @Date: 2020-06-21 17:32:28
 * @LastEditTime: 2020-06-21 22:49:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue_music\src\api\config.js
 */

// 配置跨域请求时通用的参数
// 按需导出
export const commonParams = {
  g_tk: 1928093487,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'jsonp'
}
export const options = {
  param: 'jsonpCallback',
  prefix: 'jp'
}

export const ERR_OK = 0

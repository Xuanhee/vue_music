// 对jsonp依赖进行封装
import originJsonp from 'jsonp'

export default function jsonp(url, data, options) {
  // 对传入的data数据进行处理 如果传入的地址中没有? 那么就直接加在url后面
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  // 返回一个Promise对象
  return new Promise((resolve, reject) => {
    originJsonp(url, options, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}
// 处理传入的data 参数
function param(data) {
  let url = ''
  for (var k in data) {
    // 判断data中的k值是否存在,值有可能是undefined所以要进行处理
    // 如果值是undefined 那么加在url中的属性的值就是空字符串
    const value = k === 'undefined' ? '' : data[k]
    url += `&${k}=${encodeURIComponent(value)}`
  }
  // 如果data中有数据,那么传出去的时候截去第一个& 因为接收是要做处理地址中不一定有？ 需要将第一个&改成？
  return url ? url.substring(1) : ''
}

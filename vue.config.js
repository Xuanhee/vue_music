// 这个文件是自定义 webpack的配置项 导出一个包含自定义配置选项的对象
// 引入axios依赖
const axios = require('axios')
const bodyParser = require('body-parser')
const path = require('path')
// 配置文件根目录 设置一个函数, 此函数返回一个拼接的根目录
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  devServer: {
    // open: true,
    // host: '127.0.0.1',
    // port: 8080,
    // https: false,
    // // 以上的ip和端口是我们本机的;下面为需要跨域的
    // proxy: { //配置跨域
    //   '/api': {
    //     target: 'https://localhost:8080', //这里后台的地址模拟的;应该填写你们真实的后台接口
    //     ws: true,
    //     changOrigin: true, //允许跨域
    //     pathRewrite: {
    //       '^/api': '' //请求的时候使用这个api就可以
    //     }
    //   }
    // },
    // 客户端代理跨域
    before(app) {
      // 向qq音乐官网抓取 歌单列表 将获取到的歌单数据返回
      app.get('/api/getDiscList', function (req, res) {
        const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).then((response) => {
          // console.log(response.data)
          res.json(response.data)
        }).catch((e) => {
          console.log(e)
        })
      })
      // 代理服务器   向qq音乐接口发送请求抓取轮播图数据
      app.get('/api/getRecommend', function (req, res) {
        const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
        const jumpPrefix = 'https://y.qq.com/n/yqq/album/'
        axios.get(url, {
          headers: {
            referer: 'https://u.y.qq.com/',
            host: 'u.y.qq.com'
          },
          params: req.query
        }).then(response => {
          response = response.data
          if (response.code === 0) {
            const slider = []
            // 通过代理服务器,再向返回拿到轮播图数据
            content = response.focus.data && response.focus.data.content
            // console.log(content)
            if (content) {
              content.forEach(item => {
                const sliderItem = {}
                sliderItem.id = item.id
                sliderItem.linkUrl = jumpPrefix + item.jump_info.url + '.html'
                sliderItem.picUrl = item.pic_info.url
                slider.push(sliderItem)
              })
            }
            // 直接返回获取到的轮播图数据
            res.json({
              code: 0,
              data: {
                slider
              }
            })
          } else {
            res.json(response)
          }
        }).catch(e => console.log(e))
      })
      // 代理服务器获取歌曲信息
      app.post('/api/getPurlUrl', bodyParser.json(), function (req, res) {
        const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
        axios.post(url, req.body, {
          headers: {
            referer: 'https://u.y.qq.com',
            origin: 'https://u.y.qq.com',
            'Content-type': 'application/x-www-form-urlencoded'
          }
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.log(e)
        })
      })

      // 代理服务器获取歌词信息
      app.get('/api/getLyric', (req, res) => {
        const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).then(response => {
          const ret = response.data
          if (typeof ret === 'string') {
            const reg = /^\w+\(({.+})\)$/
            const matches = ret.match(reg)
            if (matches) {
              ret = JSON.parse(matches[1])
            }
          }
          res.json(ret)
        }).catch(e => console.log(e))
      })
      // 抓取推荐列表歌曲
      app.get('/api/getCdInfo', (req, res) => {
        const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'

        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).then((response) => {
          // console.log(response.data)
          res.json(response.data)
        }).catch(e => {
          console.log(e)
        })
      })

      // 抓取搜索接口
      // app.get('/api/search', (req, res) => {
      //   const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
      //   axios.get(url, {
      //     headers: {
      //       referer: 'https://c.y.qq.com/',
      //       host: 'c.y.qq.com'
      //     },
      //     params: req.query
      //   }).then((response) => {
      //     res.json(response.data)
      //   }).catch(e => console.log(e))
      // })

      app.get('/api/search', function (req, res) {
        const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.log(e)
        })
      })
      // app.get('/api/singerList', (req, res) => {
      //   const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
      //   axios.get(url, {
      //     headers: {
      //       referer: 'https://y.qq.com',
      //       origin: 'https://y.qq.com'
      //     },
      //     params: req.query
      //   }).then(response => {
      //     res.json({
      //       code: 0,
      //       data: response.data
      //     })
      //   }).catch(e => console.log(e))
      // })
    }
  },
  // 在此配置文件的根目录 文件中引用使用 set定义的名称就是路径 不需要再./api
  chainWebpack(config) {
    config.resolve.alias
      .set('api', resolve('src/api'))
      .set('base', resolve('src/base'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
    config.when(process.env.NODE_ENV === 'production', (config) => {
      config.entry('app').clear().add('./src/main-pro.js')
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios'
      })
      // 设置开发模式下页面的标题 title
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    config.when(process.env.NODE_ENV === 'development', (config) => {
      config.entry('app').clear().add('./src/main-dev.js')
      // 设置开发模式下页面的标题 title
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  },
  publicPath: '/'
}

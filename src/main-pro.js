import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'babel-polyfill'
// 引入styl文件
import './assets/stylus/index.styl'
import axios from 'axios'
import VueLazyLoad from 'vue-lazyload'
// import './plugins/element'
// 解决手机端300毫秒延迟
import fastClick from 'fastclick'
fastClick.attach(document.body)

// 全局配置 axios
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(VueLazyLoad, {
  loading: require('assets/image/default.png')
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

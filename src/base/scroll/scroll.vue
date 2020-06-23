<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
// 自己封装滚动事件  屏幕滚动 或者是 轮播图滚动
import BScroll from 'better-scroll'
export default {
  // 配置滚动属性 接收父组件传来的数据
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    // 自定义的click
    click: {
      type: Boolean,
      default: true
    },
    // 监听一个数据的变化,刷新scroll
    data: {
      type: Array,
      default: null
    },
    // 监听滚动事件 默认不监听
    listenScroll: {
      type: Boolean,
      default: false
    },
    // 是否开启上拉加载
    pullUp: {
      type: Boolean,
      default: false
    },
    // 定义滚动之前是否做动作
    beforeScroll: {
      type: Boolean,
      default: false
    },
    // 定义监听data刷新的时间
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  // 所有dom渲染完成之后,初始化滚动组件
  mounted () {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    //   如果 wrapper不存在的时候直接返回 不调用bs滚动的组件
    _initScroll () {
      if (!this.$refs.wrapper) return
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })
      // 如果监听了listenScroll 就监听better-scroll scroll事件
      // 派发出去一个事件，由父组件去监听
      // 这里的this会指向父级作用域
      if (this.listenScroll) {
        this.scroll.on('scroll', pos => {
          this.$emit('scroll', pos)
        })
      }
      // 如果有页面需要开启下拉加载,那么 监听scrollEnd事件
      if (this.pullUp) {
        this.scroll.on('scrollEnd', () => {
          // 向下滚动是负值 滚动的越多y越小,因为是负的  设置一个滚到的距离如果比最大滚动到的距离还要小,则表示比最大的滚动距离还要远了 负值数字越大实际越小
          // 如果滚动的y距离大于 滚动的最大距离+50的距离，那就派发事件
          if (this.scroll.y <= this.scroll.maxScrollY + 20) {
            this.$emit('scrollToEnd')
          }
        })
      }
      if (this.beforeScroll) {
        // 在滚动开始之前
        this.scroll.on('beforeScrollStart', () => {
          // console.log(this.scroll)
          this.$emit('beforeScroll')
        })
      }
    },
    // 以下是做一些方法的代理
    // 开启滚动
    enable () {
      this.scroll && this.scroll.enable()
    },
    // 禁用滚动
    disable () {
      this.scroll && this.scroll.disable()
    },
    // 刷新,数据发生变化时都要刷新
    refresh () {
      this.scroll && this.scroll.refresh()
    },
    // 滚动到指定位置
    scrollTo () {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    // 滚动到指定目标元素
    scrollToElement () {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  }
}
</script>

<style lang="stylus"></style>

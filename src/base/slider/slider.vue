<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span
        class="dot"
        :class="{active: currentPageIndex === i}"
        v-for="(item, i) in dots"
        :key="i"
      ></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import BSrcoll from 'better-scroll'
import { addClass } from 'assets/js/dom'
export default {
  name: 'slider',
  // 初始化一些属性
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 轮播间隔时间
    interval: {
      type: Number,
      default: 4000
    }
  },
  data () {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  // 保证dom成功渲染完成
  mounted () {
    // 浏览器的刷新通常17毫秒一次  20毫秒是一个经验值
    setTimeout(() => {
      // 初始化操作在dom渲染完成之后 dom渲染也必须要渲染插槽内的内容.由于插槽内容中有异步操作,所以需要在插槽内容处设置一些判断条件 来判断插槽内的值是否正常渲染
      this._setSliderWidth()
      // dots要在初始化slider之前
      this._initDots()
      this._initSlider()
      if (this.autoPlay) {
        this._autopaly()
      }
    }, 20)
    // console.log('mounted')
    // 监听视口大小变化事件 以调整轮播图的大小
    window.addEventListener('resize', () => {
      // 如果没有初始化轮播图则什么都不操作
      if (!this.slider || !this.slider.enabled) {
        return
      }
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        if (this.slider.isInTransition) {
          this._onScrollEnd()
        } else {
          if (this.autoPlay) {
            this._autopaly()
          }
        }
        this.refresh()
      }, 60)
    })
  },
  activated () {
    this.slider.enable()
    const pageIndex = this.slider.getCurrentPage().pageX
    this.slider.goToPage(pageIndex, 0, 0)
    this.currentPageIndex = pageIndex
    if (this.autoPlay) {
      this._play()
    }
  },
  // 当页面切走时,清空页面中的定时器
  deactivated () {
    this.slider.disable()
    clearTimeout(this.timer)
  },
  beforeDestroy () {
    this.slider.disable()
    clearTimeout(this.timer)
  },
  methods: {
    refresh () {
      if (this.slider) {
        this._setSliderWidth(true)
        this.slider.refresh()
      }
    },
    // 设置轮播图宽度
    _setSliderWidth (isResize) {
      this.children = this.$refs.sliderGroup.children
      const sliderWidth = this.$refs.slider.clientWidth
      let width = 0
      for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i]
        addClass(child, 'slider-item')
        // 设置子元素的宽度和轮播图显示的当前宽度一致
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      // 如果是循环轮播,那么则需要给轮播图增加前后两个,如果不是循环轮播不需要加
      // 就算是重置了大小这里将不再给width增加宽度    不传参的情况下 undefined取反是true   防止宽度变大
      if (this.loop && !isResize) {
        width += sliderWidth * 2
      }
      //   console.log(width)
      // 设置轮播图总宽度
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    // 初始化dots 其实就是创建和图片相同数量的小圆圈
    _initDots () {
      // console.log(this.children)
      this.dots = new Array(this.children.length)
    },
    // 初始化轮播图 这里必须要初始化
    _initSlider () {
      this.slider = new BSrcoll(this.$refs.slider, {
        // 允许横向滚动
        scrollX: true,
        // 纵向滚动禁止
        scrollY: false,
        // 惯性
        momentum: false,
        snap: {
          // 循环
          loop: true,
          // 循环阈值
          threshold: 0.3,
          speed: 400
        }
      })
      // 监听滚动事件触发的函数,每次滚动完成获取到当前元素
      this.slider.on('scrollEnd', this._onScrollEnd)
      this.slider.on('touchend', () => {
        if (this.autoPlay) {
          this._autopaly()
        }
      })
      this.slider.on('beforeScrollStart', () => {
        if (this.autoPlay) {
          clearTimeout(this.timer)
        }
      })
    },
    // 封装滚动结束后触发的事件
    _onScrollEnd () {
      // 获取当前滚动的索
      const pageIndex = this.slider.getCurrentPage().pageX
      this.currentPageIndex = pageIndex
      if (this.autoPlay) {
        this._autopaly()
      }
    },
    // 设置自动播放的方法
    _autopaly () {
      clearTimeout(this.timer)
      // 设置自动轮播
      this.timer = setTimeout(() => {
        this.slider.next()
      }, this.interval)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';

.slider {
  min-height: 1px;
  position: relative;

  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    transform: translateZ(1px);
    text-align: center;
    font-size: 0;

    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;

      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>
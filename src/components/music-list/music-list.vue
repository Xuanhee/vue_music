<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <!-- 添加背景图片 这里是background的样式 而不是img标签-->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="filter" ref="filter"></div>
      <div class="play-wrapper" v-show="songs.length>0" ref="playBtn">
        <div class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll
      :data="songs"
      class="list"
      ref="list"
      :probeType="probeType"
      :listenScroll="listenScroll"
      @scroll="scroll"
    >
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading title="正在搜索歌曲..."></loading>
      </div>
    </scroll>
  </div>
</template>
<script>
// 引入歌曲列表组件
import SongList from 'base/song-list/song-list'
// 引入滑动组件
import Scroll from 'base/scroll/scroll'
// 引入自己定义的浏览器厂商前缀添加
import { prefixStyle } from 'assets/js/dom'
// 引入加载组件
import Loading from 'base/loading/loading'
// 引入vuex的 actions来操作数据
import { mapActions } from 'vuex'
// 引入定义的mixin
import { playlistMixin } from 'assets/js/mixin'
const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')
export default {
  mixins: [playlistMixin],
  props: {
    // 接收背景图片
    bgimage: {
      type: String,
      default: ''
    },
    // 歌手歌曲列表
    songs: {
      type: Array,
      default () {
        return []
      }
    },
    // 接收标题
    title: {
      type: String,
      default: ''
    },
    // 是否显示排行榜奖杯,接收的值再传递给song-list组件
    rank: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollY: 0
    }
  },
  created () {
    this.probeType = 3
    this.listenScroll = true
  },
  computed: {
    bgStyle () {
      return `background-image : url(${this.bgimage})`
    }
  },
  mounted () {
    // 调整滚动区域在背景图片下面
    this.ImageHeight = this.$refs.bgImage.clientHeight
    this.$refs.list.$el.style.top = `${this.ImageHeight}px`
    // 预留高度是40   向上滚动是-值 所以+个预留的40
    this.minTranslateY = -this.ImageHeight + RESERVED_HEIGHT
  },
  methods: {
    // 定义在mixin方法.这里是定义方法 mixin内部做了引用,mixin就是外部函数的内部封装 用此方法来调整scroll的 底部高度
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    // 触发滚动事件 建立一个scrollY
    scroll (pos) {
      this.scrollY = pos.y
    },
    // 点击后退按钮回退到上一级
    back () {
      this.$router.back()
    },
    // 监听到子组件派发的点击歌曲事件
    selectItem (song, i) {
      // 这里可以拿到歌曲和歌曲的索引 再通过vuex更改播放器的状态
      this.selectPlay({
        list: this.songs,
        index: i
      })
    },
    // 点击随机播放按钮 打开播放器同时进入随机播放模式
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    // 获取到actions中定义的方法
    ...mapActions(['selectPlay', 'randomPlay'])
  },
  watch: {
    // 监听scrollY的变化
    scrollY (newY) {
      // 对比滚动距离和设置的最小高度做比较
      const translateY = Math.max(this.minTranslateY, newY)
      // 设置向上滚动
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      // 获取背景图片dom
      const bgImage = this.$refs.bgImage
      // 设置层级优先级
      let zIndex = 0
      // 设置一个初始比例 小于0则表示向上滑动, 那么恢复原始比例
      let scale = 1
      // 设置放大比例
      const prenct = Math.abs(newY / this.ImageHeight)
      // 设置一个模糊度 初始是0
      let blur = 0
      // newY 大于0 则表示屏幕在向下滚动 正直
      if (newY > 0) {
        scale += prenct
        zIndex = 10
        // 最大模糊是20
        blur = Math.min(20 * prenct, 20)
      }
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`
      // 如果滚动位置小于最小的移动距离
      if (newY < translateY) {
        // 显示级别10
        zIndex = 10
        // 用padding来控制高度 设置背景图片的高度为预留高度40
        bgImage.style.paddingTop = RESERVED_HEIGHT + 'px'
        this.$refs.playBtn.style.display = 'none'
      } else {
        // 用padding来控制高度 paddingTop也就是一半高度的70% 如果滚动区域不小于最小滚动距离 也就说是还没滚到位置处那就不变化,保持原值
        bgImage.style.paddingTop = '70%'
        this.$refs.playBtn.style.display = ''
      }
      // 设置背景图片的显示层级10 或者0 根据逻辑判断来改变
      bgImage.style.zIndex = zIndex
      this.$refs.bgImage.style[transform] = `scale(${scale})`
    }
  },
  // 注册歌手的歌曲列表相关组件
  components: {
    // 歌手歌曲列表组件
    SongList,
    // 滚动组件
    Scroll,
    // 注册加载中组件
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.music-list {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;

  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;

    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }

  .title {
    position: absolute;
    top: 0;
    left: 10%;
    z-index: 40;
    width: 80%;
    no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }

  .bg-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 70%;
    transform-origin: top;
    background-size: cover;

    .play-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 50;
      width: 100%;

      .play {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;

        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }

        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
    }

    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }

  .bg-layer {
    position: relative;
    height: 100%;
    background: $color-background;
  }

  .list {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;

    .song-list-wrapper {
      padding: 20px 30px;
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>

<template>
  <div class="player" v-show="playList.length>0">
    <transition
      appear
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div
          class="middle"
          @touchstart.prevent="middleTouchstart"
          @touchmove.prevent="middleTouchmove"
          @touchend="middleTouchend"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="imgWrapper">
                <img :class="cdRotate" :src="currentSong.image" class="image" ref="cdImage" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{currentLine}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  v-for="(line,i) in currentLyric.lines"
                  :key="i"
                  :class="{'current' : i === currentLineNum}"
                >{{line.txt}}</p>
              </div>
              <div class="pure-music" v-show="this.isPureMusic">
                <p>{{pureMusicLyric}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}" @click="cdView"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}" @click="lyricView"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{timeFormat(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                :percent="percent"
                @percentChange="onProgressBarChange"
                ref="progressBar"
              ></progress-bar>
            </div>
            <span class="time time-r">{{timeFormat(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="modeIcon" @click="modeChange"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <a @click="showConfirm" style="display:inline-block" ref="download">
                <svg
                  t="1584603004013"
                  class="icon icon-down"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="2381"
                  width="200"
                  height="200"
                >
                  <path
                    d="M832 768v64H192v-64H128v128h768v-128zM822.624 438.624l-45.248-45.248L544 626.752V128h-64v498.752l-233.376-233.376-45.248 45.248L512 749.248z"
                    fill="#ffcd32"
                    p-id="2382"
                  />
                </svg>
              </a>
            </div>
            <div class="icon i-right">
              <i :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition appear name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper" ref="miniWrapper">
            <img :class="cdRotate" width="40" height="40" :src="currentSong.image" ref="miniImage" />
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control2">
          <i class="icon-prev" @click.stop="prev"></i>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i class="icon-mini" :class="miniPlayIcon" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control2">
          <i class="icon-next" @click.stop="next"></i>
        </div>
        <div class="control">
          <i class="icon-playlist" @click.stop="showPlaylist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio
      :src="currentSong.url"
      ref="audio"
      @playing="ready"
      @error="error"
      @timeupdate="timeupdate"
      @ended="end"
      @pause="paused"
    ></audio>
    <confirm title="您确定要下载吗" @confirm="downloadFile" ref="confirm"></confirm>
  </div>
</template>
<script>
import animations from 'create-keyframe-animation'
import { mapGetters, mapMutations, mapActions } from 'vuex'
// 自定义浏览器厂商前缀
import { prefixStyle } from 'assets/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/playlist/playlist'
import Confirm from 'base/confirm/confirm'
import { playMode } from 'assets/js/config'
// 引入歌词解析组件
import Lyric from 'lyric-parser'
import { playerMixin } from 'assets/js/mixin'
const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
const timeExp = /\[(\d{2}):(\d{2}):(\d{2})]/g
export default {
  mixins: [playerMixin],
  data () {
    return {
      playReady: false,
      currentTime: 0,
      radius: 32,
      // 初始化歌词信息
      currentLyric: null,
      // 默认展现cd区域
      currentShow: 'cd',
      // 初始化高亮歌词位置
      currentLineNum: 0,
      // 显示当前行歌词
      currentLine: '',
      // 判断是否为纯音乐 默认不是纯音乐
      isPureMusic: false,
      // 纯音乐歌词
      pureMusicLyric: ''
    }
  },
  created () {
    // 保留一个touch数据 不用放在data中不需要set get操作
    this.touch = {}
  },
  methods: {
    // 点击显示播放列表
    showPlaylist () {
      this.$refs.playlist.show()
    },
    // 点击显示cd转盘
    cdView () {
      this.$refs.lyricList.$el.style[transform] = 'translate3d(0,0,0)'
      this.$refs.middleL.style.opacity = 1
      this.clickTransition(1)
      this.currentShow = 'cd'
    },
    // 点击小圆圈显示歌词窗口
    lyricView () {
      this.$refs.lyricList.$el.style[transform] = `translate3d(${-window.innerWidth}px,0,0)`
      this.$refs.middleL.style.opacity = 0
      this.clickTransition(1)
      this.currentShow = 'lyric'
    },
    // 过渡时间的封装
    clickTransition (s) {
      this.$refs.middleL.style[transitionDuration] = `${s}s`
      this.$refs.lyricList.$el.style[transitionDuration] = `${s}s`
    },
    // 点击收回按钮隐藏播放器
    back () {
      this.setFullScreen(false)
    },
    // mini功能显示播放器
    open () {
      this.setFullScreen(true)
    },
    togglePlaying () {
      if (!this.playReady) return
      this.setPlayState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    }),
    // 在vue的transition标签中设置js钩子来做动画效果
    // enter就是从哪来(一定不是当前位置)
    enter (el, done) {
      // 获取到位移的坐标和缩放比例
      const { x, y, scale } = this._getPosAndScale()
      // 用js 定义动画
      const animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        // 到60%的时候就移动到指定位置然后放大1.1
        60: {
          transform: 'translate3d(0, 0, 0) scale(1.1)'
        },
        100: {
          transform: 'translate3d(0, 0, 0) scale(1)'
        }
      }
      // 必须要引用第三方插件来让js做动画效果 从而创建css的动画效果
      animations.registerAnimation({
        // 动画的名称
        name: 'move',
        // 定义的动画
        animation,
        // 设置动画的样式 间隔400毫秒 线性的
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      // 执行动画, 传入要执行动画的dom 动画名称,还有done
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    // 在afterEnter中删除动画
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      // 获取到位移的坐标和缩放比例
      const { x, y, scale } = this._getPosAndScale()
      // 关闭播放器时 cd图片缩小 不做其他动画样式,那就可以直接用js来写
      this.$refs.cdWrapper.style.transition = 'all .4s'
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    // 获取到x,y和scale三个数据
    _getPosAndScale () {
      // 左下角小转盘宽高
      const targetWidth = 40
      // 左下角小转盘距离左边的距离
      const paddingLeft = 40
      // 左下角小cd距离底部的距离
      const paddingBottom = 30
      // 大CD 距离顶部的距离
      const cdTop = 80
      // cd转盘的宽度和高度, (正方形)
      const width = window.innerWidth * 0.8
      // 放大和缩小比例
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - width / 2 - cdTop - paddingBottom
      // 将x y scale 的结果返回出去
      return { x, y, scale }
    },
    // 内部transform变化要同步到外部
    syncWrapperTransform (wrapper, inner) {
      // 如果没有外部容器则直接返回
      if (!this.$refs[wrapper]) {
        return
      }
      // 有外部容器则进行transform的同步
      // 先拿到外部容器和内部容器的dom
      const iWrapper = this.$refs[wrapper]
      const iInner = this.$refs[inner]
      // 然后再拿到两个dom各自的transform样式 不能用.style[]这是设置 获取样式要用getComputedStyle
      const wTransform = getComputedStyle(iWrapper)[transform]
      const iTransform = getComputedStyle(iInner)[transform]
      // console.log('内' + iTransform)
      // 最后返回最新的样式,把子元素的transform样式同步给父容器
      iWrapper.style[transform] = wTransform === 'none' ? iTransform : iTransform.concat(' ', wTransform)
      // console.log('外' + wTransform)
    },
    // 点击切换下一首个
    next () {
      // 如果歌曲还没准备好直接返回
      if (!this.playReady) return
      if (this.playList.length === 1) {
        this.loop()
      } {
        // 通过currentIndex来控制播放歌曲
        let index = this.currentIndex + 1
        if (index === this.playList.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    },
    // 点击切换上一首歌
    prev () {
      // 如果只有一首歌的列表,那就进入无限循环的播放模式, 不然会报错,因为监听不到切换歌曲,那么所有的逻辑代码都会失效
      // 如果歌曲还没准备好直接返回
      if (!this.playReady) return
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index < 0) {
          index = this.playList.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    },
    // 播放器的canplay事件 此事件判断歌曲是否可以播放,防止极限操作
    ready () {
      clearTimeout(this.timer)
      // 调用vuex中的action,保存播放歌曲到播放列表
      this.savaPlayHistory(this.currentSong)
      // 标志位,限制频繁操作
      this.playReady = true
      this.canLyricPlay = true
      if (this.currentLyric && !this.isPureMusic) {
        this.currentLyric.seek(this.currentTime * 1000)
      }
    },
    paused () {
      this.setPlayState(false)
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
    },
    error () {
      clearTimeout(this.timer)
      this.playReady = true
    },
    // audio元素自带的事件,获取当前播放时间戳
    timeupdate (e) {
      this.currentTime = e.target.currentTime
    },
    // 音乐播放结束时候进行自动切换,同时判断是循环播放还是 其他的播放模式
    end () {
      if (this.mode === playMode.loop) {
        // 调用循环播放方法
        this.loop()
      } else {
        // 否则就是其他的播放模式,播放下一首歌曲,调用next方法.让当前播放索引+1 不能超过总长度
        this.next()
      }
    },
    loop () {
      // 循环播放其实就是让播放时间归0
      this.$refs.audio.currentTime = 0
      // 同时再次开启播放
      this.$refs.audio.play()
      this.setPlayState(true)
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    // 封装获取歌词的方法
    getLyric () {
      this.currentSong.getLyric().then((res) => {
        // 做边界处理,如果当前歌曲的lyric属性 和res这个歌词不一致,那么直接返回
        if (this.currentSong.lyric !== res) return
        // Lyric格式化歌词的构造函数传递两个参数，一个是歌词数据，第二个是回调函数
        this.currentLyric = new Lyric(res, this.handleLyric)
        // console.log(this.currentLyric)
        // 判断是否为纯音乐   如有有歌词长度,那么就不是纯音乐,如果没有歌词长度就是纯音乐
        this.isPureMusic = !this.currentLyric.lines.length
        if (this.isPureMusic) {
          this.pureMusicLyric = this.currentLyric.lrc.replace(timeExp, '').trim()
          this.currentLine = this.pureMusicLyric
        } else {
          if (this.playing && this.canLyricPlay) {
            // 这个时候有可能用户已经播放了歌曲，要切到对应位置
            this.currentLyric.seek(this.currentTime * 1000)
          }
        }
      }).catch(() => {
        // 如果获取歌词失败,那么要清除一些缓存操作
        // cd下方显示的每行歌词清空
        this.currentLine = ''
        // Lyric的实例清空
        this.currentLyric = null
        // 歌词行数清零
        this.currentLineNum = 0
      })
    },
    // Lyric第二个参数的回调函数中自带有一个对象参数
    handleLyric ({ lineNum, txt }) {
      if (!this.$refs.lyricLine) {
        return
      }
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        // vue的dom需要使用.$el才能操作dom元素
        const lineEl = this.$refs.lyricLine[lineNum - 5]
        // 使用bsScroll的方法 scrollToElement 将屏幕顶部滚动目标元素
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.currentLine = txt
    },
    // 点击歌词和cd实现左右移动功能
    // 点击歌词或cd的父元素
    middleTouchstart (e) {
      this.touch.initiated = true
      // 锁定横向操作 解决波浪线操作时出现的不好体验
      this.touch.directionLocked = ''
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
      // 用来判断是否是一次移动
      this.touch.moved = false
    },
    // 滑动屏幕
    middleTouchmove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const detalX = touch.pageX - this.touch.startX
      const detalY = touch.pageY - this.touch.startY
      // 如果上下滑动的距离大于左右滑动的距离
      const absDeltaX = Math.abs(detalX)
      const absDeltaY = Math.abs(detalY)
      // 边界处理, directionLocked为空值时才进入此操作
      if (!this.touch.directionLocked) {
        if (absDeltaX > absDeltaY) {
          this.touch.directionLocked = 'h' // lock horizontally
        } else if (absDeltaY >= absDeltaX) {
          this.touch.directionLocked = 'v' // lock vertically
        }
      }
      // 如果是v 则表示竖向操作的距离比横向操作大了,不做任何操作,直接返回
      if (this.touch.directionLocked === 'v') {
        return
      }
      if (!this.touch.moved) {
        this.touch.moved = true
      }
      // 滑动的最终位置 如果是cd那么 歌词界面不位移,否则歌词界面位移
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      // 位移的距离
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, (detalX + left)))
      // 滑动距离的比例
      this.touch.percent = offsetWidth / -window.innerWidth
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0,0)`
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
      this.$refs.lyricList.$el.style[transitionDuration] = 0
    },
    // 手指离开屏幕后,固定歌词或者CD的显示
    middleTouchend () {
      // 如果只是点了一下屏幕,不触发切换逻辑
      if (!this.touch.moved) {
        return
      }
      let offsetWidth
      let opacity
      // 如果在cd区域 否则就是 lyric歌词区域
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.2) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        if (this.touch.percent < 0.8) {
          opacity = 1
          offsetWidth = 0
          this.currentShow = 'cd'
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 500
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = time + 'ms'
      this.$refs.middleL.style[transitionDuration] = time + 'ms'
      this.$refs.middleL.style.opacity = opacity
      this.touch.initiated = false
    },
    timeFormat (interval) {
      //   |0  表示向下取整
      const time = interval | 0
      const minutes = time / 60 | 0
      const second = this._pad(time % 60)
      return `${minutes}:${second}`
    },
    // 定义一个小于2位数的数前面+0
    _pad (num, n = 2) {
      // 拿到num的长度
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    // 拖动滚动条之后播放的最新的播放状态
    onProgressBarChange (percent) {
      // percent是拖动的宽度和总宽度的最新比例 用这个比例乘 播放时间就是当前的播放时间了
      const currentTime = percent * this.currentSong.duration
      this.currentTime = this.$refs.audio.currentTime = currentTime
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    // 点击下载弹出确认框
    showConfirm () {
      this.$refs.confirm.show()
    },
    // 点击a下载图标下载歌曲
    downloadFile () {
      // const iframe = document.createElement('iframe')
      // iframe.style.visibility = 'hidden'
      // document.body.appendChild(iframe)
      // iframe.src = this.currentSong.url
      const request = new XMLHttpRequest()
      request.open('get', this.currentSong.url, true)
      request.responseType = 'blob'
      // 请求完成之后设置url 和download
      request.onload = () => {
        const response = request.response
        if (response) {
          // downloadJs(new Blob([response], { type: 'audio/mp3' }), this.currentSong.name, 'audio/mp3')
          // console.log(response)
          const url = window.URL.createObjectURL(new Blob([response], { type: 'audio/mp3' }))
          const a = document.createElement('a')
          console.log(a)
          a.href = url
          a.download = this.currentSong.name
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
        }
      }
      request.send()
    },
    ...mapActions([
      'savaPlayHistory'
    ])
  },
  computed: {
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniPlayIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls () {
      return this.playReady ? '' : 'disable'
    },
    // mini功能 cd是否转圈
    cdRotate () {
      return this.playing ? 'play' : 'pause'
    },
    // 进度条比例
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters(['fullScreen', 'playing', 'currentIndex'])
  },
  // 监听当前播放歌曲和播放状态
  watch: {
    // 监听歌曲播放状态
    playing (newPlaying) {
      if (!this.playReady) return
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
      if (!newPlaying) {
        if (this.fullScreen) {
          // 全屏大cd旋转
          this.syncWrapperTransform('imgWrapper', 'cdImage')
          // 缩小后小cd旋转
        } else {
          this.syncWrapperTransform('miniWrapper', 'miniImage')
        }
      }
    },
    currentSong (newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) return
      // 设置播放状态false
      this.playReady = false
      this.canLyricPlay = false
      if (this.currentLyric) {
        this.currentLyric.stop()
        // 先将所有播放数据清空
        this.currentLyric = null
        this.currentLineNum = 0
        this.currentLine = ''
        this.currentTime = 0
      }
      this.$refs.audio.src = newSong.url
      // 然后进行播放 进行播放后如果可以播放audio的 canplay属性的方法会被调用
      setTimeout(() => {
        // 因为playReady被设置成了false.但是playing还是ture所以延迟播放,否则会报bug
        this.$refs.audio.play()
      }, 20)
      // 若歌曲5s未播放,则任务超时,canplay方法未调用,那么playReady的状态还是false 就无法进入到切歌的逻辑流程中,必须要修改状态确保可以切换歌曲
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.playReady = true
      }, 5000)
      this.getLyric()
    },
    // 监视播放器是否全屏
    fullScreen (newVal) {
      if (newVal) {
        // 设置进度条
        setTimeout(() => {
          this.$refs.progressBar.setProgressOffset(this.percent)
        }, 20)
      }
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist,
    Confirm
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);

              &.play {
                animation: rotate 20s linear infinite both;
              }

              &.pause {
                animation-play-state: paused;
              }
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }

          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
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

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;

          .icon-down {
            height: 30px;
            width: 30px;
          }
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        // 回弹效果贝赛尔曲线
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;

      .imgWrapper {
        height: 100%;
        width: 100%;

        img {
          border-radius: 50%;

          &.play {
            animation: rotate 10s linear infinite;
          }

          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }

    .control2 {
      flex: 0 0 26px;
      width: 26px;

      .icon-prev, .icon-next {
        font-size: 26px;
        color: $color-theme;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :currentIndex="currentIndex" :switches="switches" @selectSwitch="selectSwitch"></switches>
      </div>
      <div class="play-btn" ref="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper" v-if="currentIndex === 0">
        <scroll class="list-scroll" :data="favoriteList" ref="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="play"></song-list>
          </div>
        </scroll>
      </div>
      <div class="list-wrapper" ref="listWrapper" v-if="currentIndex === 1">
        <scroll class="list-scroll" :data="playHistory" ref="playlist">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="play"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultTitle"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
import Switches from 'base/switches/switches'
import SongList from 'base/song-list/song-list'
import Scroll from 'base/scroll/scroll'
import NoResult from 'base/no-result/no-result'
import Song from 'assets/js/song'
import { playlistMixin } from 'assets/js/mixin'
import { mapGetters, mapActions } from 'vuex'
export default {
  mixins: [playlistMixin],
  data () {
    return {
      currentIndex: 0,
      switches: [{
        name: '我喜欢的'
      }, {
        name: '最近播放'
      }]
    }
  },
  computed: {
    // 判断何时显示no-result组件
    noResult () {
      if (this.currentIndex === 0) {
        return !this.favoriteList.length
      } else {
        return !this.playHistory.length
      }
    },
    // 边界处理没有喜欢记录和播放记录是提示用户的信息
    noResultTitle () {
      if (this.currentIndex === 0) {
        return '暂无喜欢的歌曲,快去添加喜欢的歌曲吧!'
      } else {
        return '您还没有听过歌曲,想听什么就去听吧!'
      }
    },
    ...mapGetters([
      'favoriteList',
      'playHistory'
    ])
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      this.$refs.favoriteList && this.$refs.favoriteList.refresh()
      this.$refs.playlist && this.$refs.playlist.refresh()
    },
    //   监听switches组件的 点击事件 切换index 切换tab栏
    selectSwitch (index) {
      this.currentIndex = index
    },
    back () {
      this.$router.go(-1)
    },
    // 监听song-list组件派发的事件，播放歌曲
    play (item, index) {
      this.insertSong(new Song(item))
    },
    // 点击随机播放
    random () {
      let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
      // 如果list没有数据,那就直接返回 节省资源
      if (list.length === 0) return
      //   初始化一下list,因为song的实例才能调用歌词方法,直接从本地或者vuex中拿到的只是数据,而不是实例
      list = list.map((item) => {
        return new Song(item)
      })
      console.log(list)
      this.randomPlay({
        list
      })
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  },
  components: {
    Switches,
    SongList,
    Scroll,
    NoResult
  }
}
</script>

<style lang="stylus">
@import '~assets/stylus/variable';

.user-center {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
  background: $color-background;

  &.slide-enter-active, &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter, &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

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

  .switches-wrapper {
    margin: 10px 0 30px 0;
  }

  .play-btn {
    box-sizing: border-box;
    width: 135px;
    padding: 7px 0;
    margin: 0 auto;
    text-align: center;
    border: 1px solid $color-text-l;
    color: $color-text-l;
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

  .list-wrapper {
    position: absolute;
    top: 110px;
    bottom: 0;
    width: 100%;

    .list-scroll {
      height: 100%;
      overflow: hidden;

      .list-inner {
        padding: 20px 30px;
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}</style>
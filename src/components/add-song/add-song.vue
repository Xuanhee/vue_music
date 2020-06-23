<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box @query="onQueryChage" ref="searchBox"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" @selectSwitch="selectSwitch" :currentIndex="currentIndex"></switches>
        <div class="list-wrapper">
          <scroll class="list-scroll" :data="playHistory" v-if="currentIndex===0" ref="playlist">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="play"></song-list>
            </div>
          </scroll>
          <scroll
            class="list-scroll"
            :data="searchHistory"
            v-if="currentIndex===1"
            ref="searchList"
          >
            <div class="list-inner">
              <search-list :searchHistory="searchHistory" @select="addQuery" @delete="deleteSearch"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" @select="selectSuggest" :showSinger="false" @listScroll="inputBlur"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">成功添加一首歌曲到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>
<script>
import SearchBox from 'base/search-box/search-box'
import Suggest from 'components/suggest/suggest'
import Switches from 'base/switches/switches'
import SongList from 'base/song-list/song-list'
import Scroll from 'base/scroll/scroll'
import SearchList from 'base/search-list/search-list'
import TopTip from 'base/top-tip/top-tip'
import Song from 'assets/js/song'
import { searchMixin } from 'assets/js/mixin'
import { mapGetters, mapActions } from 'vuex'
export default {
  mixins: [searchMixin],
  data () {
    return {
      showFlag: false,
      query: '',
      // 定义switch组件中显示的分类名称
      switches: [{
        name: '播放历史'
      }, {
        name: '搜索历史'
      }],
      currentIndex: 0
    }
  },
  computed: {
    ...mapGetters([
      'playHistory'
    ])
  },
  methods: {
    // 显示此组件
    show () {
      this.showFlag = true
      this.listRefresh()
    },
    // 封装刷新滚动的方法
    listRefresh () {
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.playlist.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 20)
    },
    // 隐藏此组件
    hide () {
      this.showFlag = false
    },
    // 监听suggest的 select事件 保存搜索记录
    selectSuggest () {
      this.savaSearch()
      // 点击搜索结果中的歌曲添加播放
      this.showTopTip()
    },
    // 监听switches组件传来的事件点击切换播放历史或者搜索历史
    selectSwitch (index) {
      this.currentIndex = index
    },
    // 监听song-list组件的点击事件 点击播放历史中的歌曲播放歌曲
    play (item, index) {
      this.showTopTip()
      // console.log(item)
      this.insertSong(new Song(item))
    },
    showTopTip () {
      this.$refs.topTip.show()
    },
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    // 监听 search-box的事件,事实监听搜索框变化,
    query (newQuery) {
      // 如果没有数据了,刷新播放历史 和搜索历史的滚动条
      if (!newQuery) {
        this.listRefresh()
      }
    }
  },
  components: {
    SearchBox,
    Suggest,
    Switches,
    SongList,
    Scroll,
    SearchList,
    TopTip
  }
}
</script>
<style lang="stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;

  &.slide-enter-active, &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter, &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

  .header {
    position: relative;
    height: 44px;
    text-align: center;

    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }

    .close {
      position: absolute;
      top: 0;
      right: 8px;

      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }

  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
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
  }

  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }

  .tip-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;

    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }

    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
</style>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex'
import {
  playMode
} from 'assets/js/config'
// 引入自定义的洗牌函数
import {
  shuffle
} from 'assets/js/util'
// mixin其实就是封装了一些钩子和方法 然后再适用到不同的组件中,组件中同名的方法会覆盖掉这里的方法
export const playlistMixin = {
  computed: {
    ...mapGetters(['playList'])
  },
  mounted() {
    this.handlePlaylist(this.playList)
  },
  activated() {
    this.handlePlaylist(this.playList)
  },
  // 这个mixin的作用主要就是监听playlist的变化
  watch: {
    playList(newList) {
      this.handlePlaylist(newList)
    }
  },
  methods: {
    // 这里是定义方法 写在外部也是定义方法
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    modeIcon() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'mode',
      'playList',
      'favoriteList'
    ])
  },
  methods: {
    // 播放模式的变更
    modeChange() {
      const mode = (this.mode + 1) % 3
      this.setMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    // 随机播放后找到当前歌曲的索引
    resetCurrentIndex(list) {
      const index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    // 动态为喜欢的歌曲添加类名,改变图标,
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      } else {
        return 'icon-not-favorite'
      }
    },
    // 点击喜欢图标来切换喜欢状态
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteSong(song)
      } else {
        this.savaFavoriteSong(song)
      }
    },
    // 封装的判断是不是喜欢的歌曲
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return song.id === item.id
      })
      return index > -1
    },
    ...mapMutations({
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayState: 'SET_PLAYING_STATE',
      setPlayList: 'SET_PLAY_LIST',
      setMode: 'SET_MODE'
    }),
    ...mapActions([
      'savaFavoriteSong',
      'deleteFavoriteSong'
    ])
  }
}

export const searchMixin = {
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    // 从serach-box 组件中获取到最新的搜索框内容
    onQueryChage(newQuery) {
      // if (!newQuery) return
      // console.log(!newQuery)
      this.query = newQuery
    },
    inputBlur() {
      // 引用searchBox组件中blur方法(如果没有就去组件中定义)此事件的作用就是让滚动时让input失去焦点
      this.$refs.searchBox.blur()
    },
    // 监听从suggest派发来的select事件 保存点击历史记录
    savaSearch() {
      // 此事件是保存历史记录
      this.savaSearchHistory(this.query)
    },
    // 引用searchBox的事件,点击热门搜索
    addQuery(key) {
      this.$refs.searchBox.setQuery(key)
    },
    // 监听从search-list传来的删除事件
    deleteSearch(item) {
      // 删除本地历史记录
      this.deleteSearchHistory(item)
    },
    ...mapActions(['savaSearchHistory', 'deleteSearchHistory'])
  }
}

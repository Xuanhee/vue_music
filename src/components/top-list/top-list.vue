<template>
  <transition appear name="slide">
    <music-list :bgimage="bgimage" :title="title" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import { getMusicList } from 'api/rank'
import { ERR_OK } from 'api/config'
import { mapGetters } from 'vuex'
import { createSong, isValidMusic, processSongsUrl } from 'assets/js/song'
export default {
  data () {
    return {
      songs: [],
      // 显示排行奖杯
      rank: true
    }
  },
  created () {
    this._getMusicList()
  },
  computed: {
    title () {
      return this.musicList.topTitle
    },
    bgimage () {
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    },
    ...mapGetters([
      'musicList'
    ])
  },
  methods: {
    // 获取排行榜歌单
    _getMusicList () {
      // 边界处理,如果vuex还没获取到musicList数据,则返回到上一级路由
      if (!this.musicList.id) {
        this.$router.push('/rank')
      }
      // 获取排行榜的歌曲列表,筛选出免费歌曲, 把所有收费歌曲去除掉
      getMusicList(this.musicList.id).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeMusicList(res.songlist)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    _normalizeMusicList (list) {
      const ret = []
      list.forEach((item) => {
        if (isValidMusic(item.data)) {
          ret.push(createSong(item.data))
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style lang="stylus" scope>
.slide-enter-active .slide-leave.active {
  transition: all, 0.4s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(0, 100%, 0);
}
</style>
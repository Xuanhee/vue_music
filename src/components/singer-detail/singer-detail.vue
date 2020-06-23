<template>
  <transition appear name="slide">
    <music-list :title="title" :bgimage="bgimage" :songs="songs"></music-list>
  </transition>
</template>
<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from 'api/singerList'
import { ERR_OK } from 'api/config'
import { createSong, processSongsUrl, isValidMusic } from 'assets/js/song'
import MusicList from '../music-list/music-list'
export default {
  data () {
    return {
      songs: []
    }
  },
  created () {
    this._getSingerDetail()
  },
  computed: {
    // 映射为comouted属性
    ...mapGetters([
      'singer'
    ]),
    title () {
      return this.singer.name
    },
    bgimage () {
      return this.singer.avatar
    }
  },
  methods: {
    // 对数据进行边缘化处理避免错误刷新
    _getSingerDetail () {
      if (!this.singer.id) {
        return this.$router.push('/singer')
      }
      // 封装获取歌手详情的方法
      getSingerDetail(this.singer.id).then(res => {
        if (res.code === ERR_OK) {
          // 对拿到的歌手详情信息进行处理 拿到我们需要的数据
          processSongsUrl(this._normalizeSong(res.data.list)).then(res => {
            this.songs = res
            // console.log(this.songs)
          })
        }
      })
    },
    _normalizeSong (list) {
      const ret = []
      list.forEach(item => {
        // 解构出歌曲信息
        const { musicData } = item
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      // console.log(ret)
      return ret
    }
  },
  // 注册歌曲列表组件
  components: {
    MusicList
  }
}
</script>
<style lang="stylus" scope>
.slide-enter-active, .slide-leave-active {
  transition: all 0.5s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(0, 100%, 0);
}
</style>

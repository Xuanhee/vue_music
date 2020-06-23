<template>
  <transition appear name="slider">
    <music-list :title="title" :bgimage="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
import MusicList from '../music-list/music-list'
import { mapGetters } from 'vuex'
import { getCdInfo } from 'api/recommend'
import { createSong, isValidMusic, processSongsUrl } from 'assets/js/song'
import { ERR_OK } from 'api/config'
export default {
  data () {
    return {
      songs: []
    }
  },
  created () {
    this._getCdInfo()
  },
  computed: {
    // return this.disc
    title () {
      return this.disc.dissname
    },
    bgImage () {
      return this.disc.imgurl
    },
    ...mapGetters([
      'disc'
    ])
  },
  methods: {
    // 获取歌曲列表
    _getCdInfo () {
      // 边界处理 没有数据时候不跳转到列表页
      if (!this.disc.dissid) {
        this.$router.push({
          path: '/recommend'
        })
        return
      }
      getCdInfo(this.disc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSong(res.cdlist[0].songlist)).then(res => {
            this.songs = res
          })
        }
      })
    },
    // 对推荐歌曲进行处理,筛除收费的歌曲,同时对歌曲的url做处理
    _normalizeSong (list) {
      const ret = []
      list.forEach(musicData => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
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
// transition标签包裹的过渡动画如果不一样,那么在不同组件中的命名也要不一样
.slider-enter-active, .slider-leave-active {
  transition: all 0.4s;
}

.slider-enter, .slider-leave-to {
  transform: translate3d(-100%, 0, 0);
}
</style>

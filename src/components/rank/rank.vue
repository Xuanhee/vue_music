<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" :data="topList" ref="topList">
      <ul>
        <li class="item" v-for="(item,i) in topList" :key="i" @click="selectItem(item)">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl" />
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song,index) in item.songList" :key="index">
              <span>{{index+1}}.</span>
              <span>{{song.singername}}-{{song.songname}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>
<script text="ecmascript-6">
import { getTopList } from 'api/rank'
import { ERR_OK } from 'api/config'
import Scroll from 'base/scroll/scroll'
import { playlistMixin } from 'assets/js/mixin'
import Loading from 'base/loading/loading'
import { mapMutations } from 'vuex'
export default {
  mixins: [playlistMixin],
  data () {
    return {
      topList: []
    }
  },
  created () {
    this._getTopList()
  },
  methods: {
    // 获取排行歌曲列表的方法
    _getTopList () {
      getTopList().then((res) => {
        console.log(1)
        if (res.code === ERR_OK) {
          this.topList = res.data.topList
        }
      })
    },
    // playlistMixin中定义的方法 监听vuex中的playlist,功能是只要进入过播放器获取过播放列表,那么底部的bottom值就应该加60
    handlePlaylist (playlist) {
      const bottom = playlist.length ? '60px' : ''
      this.$refs.rank.style.bottom = bottom
      // this.$refs.topList.refresh()
    },
    // 点击某个排行榜跳转到歌曲列表页面
    selectItem (item) {
      // 通过vuex传递歌曲列表的数据
      this.setMusicList(item)
      this.$router.push(`/rank/${item.id}`)
    },
    ...mapMutations({
      setMusicList: 'SET_MUSIC_LIST'
    })
  },
  components: {
    Scroll,
    Loading
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .toplist {
    height: 100%;
    overflow: hidden;

    .item {
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;

      &:last-child {
        padding-bottom: 20px;
      }

      .icon {
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      }

      .songlist {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;

        .song {
          no-wrap();
          line-height: 26px;
        }
      }
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

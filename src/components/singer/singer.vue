<template>
  <div class="singer" ref="singer">
    <list-view @select="select" :data="singers" ref="listview"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import { getSingerList } from 'api/singerList'
import { ERR_OK } from 'api/config'
import Singer from 'assets/js/singer'
import ListView from 'base/listview/listview'
import { mapMutations } from 'vuex'
import { playlistMixin } from 'assets/js/mixin'
const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10
export default {
  mixins: [playlistMixin],
  data () {
    return {
      singers: []
    }
  },
  // 页面dom渲染之前
  created () {
    this._getSingerList()
  },
  methods: {
    // 定义playlistMixin中的方法 解决底部没有计算bottom的方法
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : 0
      this.$refs.singer.style.bottom = bottom
      this.$refs.listview.refresh()
    },
    // 点击歌手可以跳转到歌手详情页, 监听子组件中派发的点击事件
    select (singer) {
      this.$router.push(`/singer/${singer.id}`)
      this.SET_SINGER(singer)
    },
    // 获取歌手信息并分类
    _getSingerList () {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          // 拿到歌手数据后对歌手数据进行字母分类
          this.singers = this._normalizeSinger(res.data.list)
          // console.log(this.singers)
        }
      })
    },
    // 封装 将歌手数据进行分类处理
    _normalizeSinger (list) {
      const map = {
        // 收集热门数据
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        // 取前10个数据作为热门数据
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer(
            item.Fsinger_mid,
            item.Fsinger_name
          ))
        }
        // 将歌手数据按照字母进行分类
        const key = item.Findex
        // 如果歌手数据中没有这个字母开头的数据,那么就建立一个此数据,数据内是歌手的信息
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        // 拿到了字母之后对歌手数据进行分类添加  添加的属性已经通过歌手类进行了封装
        map[key].items.push(new Singer(
          item.Fsinger_mid,
          item.Fsinger_name
        ))
      })
      // 获取到歌手的字母分类数据后, 对字母进行一个排序, 默认热门在第一个
      const hot = []
      const ret = []
      for (const key in map) {
        const val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // 额外添加一个歌手 - -
      ret.push({
        title: 'D',
        items: [new Singer(
          '001fNHEf1SFEFN',
          'G.E.M.邓紫棋'
        )]
      })
      // 对字母分类进行排序
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      // 拼接两个数组
      // console.log([...hot, ...ret])
      return hot.concat(ret)
    },
    ...mapMutations(['SET_SINGER'])
  },
  // 注册歌手列表组件
  components: {
    ListView
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>

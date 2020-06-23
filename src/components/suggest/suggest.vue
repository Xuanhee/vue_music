<template>
  <scroll
    class="suggest"
    ref="suggest"
    :data="result"
    :pullUp="pullUp"
    @scrollToEnd="searchMore"
    :beforeScroll="beforeScroll"
    @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="(item,i) in result" :key="i" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <!-- 上拉加载的时候显示加载中组件 只要有更多就显示加载中-->
      <loading v-show="hasMore" title="正在为您搜索更多歌曲..."></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import { search } from 'api/search'
import { ERR_OK } from 'api/config'
import { isValidMusic, createSong, processSongsUrl } from 'assets/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import NoResult from 'base/no-result/no-result'
import Singer from 'assets/js/singer'
import { mapMutations, mapActions } from 'vuex'
const TYPE_SINGER = 'singer'
const perpage = 120

export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      page: 1,
      result: [],
      // 开启下拉加载
      pullUp: true,
      // 是否还有更多搜索内容,默认没有
      hasMore: false,
      beforeScroll: true
    }
  },
  created () {
  },
  methods: {
    // 只要query发生变化就发送请求
    _getSearch () {
      this.page = 1
      // 将查询更多设置为true  在_checkResult函数中取判断是否还有更多数据
      this.hasMore = true
      // 初始化一开始搜索默认滚动到顶部
      this.$refs.suggest.scrollTo(0, 0)
      // 根据搜索框内容,查询页数,是否显示歌手,每页显示多少条来查询搜索结果
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = result
            // 检查返回结果是否还有下一页,如果有则查询更多,如果没有则不再查询
            setTimeout(() => {
              this._checkResult(res.data)
            }, 20)
          })
        }
      })
    },
    // 处理获取到的搜索信息
    _genResult (data) {
      const ret = []
      // 如果有zhida属性,并且还有歌手id,那么一定是歌手,添加  给歌手添加一个type属性
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        // 利用 {} 和 展开运算符将两个对象 合并成一个对象
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } })
      }
      // 筛选出免费的歌曲然后和歌手进行拼接,如果没有歌手,则直接返回的是歌曲的数组列表
      return processSongsUrl(this._normalizeSong(data.song.list)).then((res) => {
        return ret.concat(res)
      })
    },
    // 判断歌曲是否收费,分类歌曲
    _normalizeSong (list) {
      const ret = []
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    // 如果是歌手则显示头像图标,如果是歌曲显示歌曲图标 返回的结果不一样所以需要做判断,在数据分类的时候添加一个歌手type属性
    getIconCls (item) {
      // console.log(item)
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    // 获取歌曲名称或者歌手名称 因为返回值不一样一个是singername 一个是name 所以需要做判断
    getDisplayName (item) {
      // 说明是歌手
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name} - ${item.singer}`
      }
    },
    // 监听滚轮滚动结束事件
    searchMore () {
      // 边缘处理,如果没有更多搜索数据,则不做任何操作
      if (!this.hasMore) return
      // 页码数+1
      this.page++
      // 然后再发生请求获取下一页的数据
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        // 整理拿到的数据
        if (res.code === ERR_OK) {
          this._genResult(res.data).then((result) => {
            this.result = this.result.concat(result)
            // 然后在判断一下是否还有更多内容,如果有则继续搜索
            setTimeout(() => {
              this._checkResult(res.data)
            }, 20)
          })
        }
      })
    },
    // 检索是否还有多余的搜索内容
    _checkResult (data) {
      const song = data.song
      // 如果没有多余歌曲 或者搜索到的歌曲比接口中数据多或者数量一样,那么就把标志位 hasMore设置为false
      if (!song.list.length || (song.curnum + (song.curpage - 1) * perpage) >= song.totalnum) {
        this.hasMore = false
      } else {
        // 如果没有竖向滑动 hasVerticalScroll为false,走到这步程序了,那么也可以执行搜索更多
        if (!this.$refs.suggest.scroll.hasVerticalScroll) {
          this.searchMore()
        }
      }
    },
    // 点击搜索列表中的信息后跳转
    selectItem (item) {
      // 如果点击的是歌手,那就跳转到歌手页面,建立一个search的二级路由,跳转到歌手页面
      if (item.type === TYPE_SINGER) {
        // 同时singer-detail是通过vuex来通信数据的,所以需要setSinger
        this.setSinger(new Singer(item.singermid, item.singername))
        this.$router.push(`/search/${item.singermid}`)
      } else {
        // 如果点击的是歌曲,那就直接打开播放器,同样要通过vuex来通信,设置播放的歌曲,播放器打开 和播放状态等等...
        this.insertSong(item)
      }
      // 跳转完成之后保存记录 派发出去一个事件 谁调用该组件谁获取该事件
      this.$emit('select')
    },
    refresh () {
      this.$refs.suggest.refresh()
    },
    // 监听从scroll组件派发来的listScroll事件
    listScroll () {
      // 这里也不做什么操作也把事件派发出去
      this.$emit('listScroll')
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions(['insertSong'])
  },
  watch: {
    // 监听其他组件传来的搜索框内容,
    query (newQuery) {
      if (!newQuery) return
      this._getSearch()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>

<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChage"></search-box>
    </div>
    <div class="shortcut-wrapper" ref="shortcutWrapper" v-show="!query">
      <scroll class="shortcut" ref="shortcut" :data="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" v-for="(key,i) in hotKey" :key="i">
                <span @click="addQuery(key.k)">{{key.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searchHistory="searchHistory" @select="addQuery" @delete="deleteSearch"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" ref="searchResult" v-show="query">
      <suggest :query="query" @listScroll="inputBlur" @select="savaSearch" ref="suggest"></suggest>
    </div>
    <confirm ref="confirm" title="您确定要删除所有记录?" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import { getHotKey } from 'api/search'
import { ERR_OK } from 'api/config'
import Suggest from 'components/suggest/suggest'
import SearchBox from 'base/search-box/search-box'
import Scroll from 'base/scroll/scroll'
import SearchList from 'base/search-list/search-list'
import Confirm from 'base/confirm/confirm'
import { mapActions } from 'vuex'
import { playlistMixin, searchMixin } from 'assets/js/mixin'
export default {
  mixins: [playlistMixin, searchMixin],
  data () {
    return {
      hotKey: [],
      query: ''
    }
  },
  created () {
    this._getHotKey()
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length ? '60px' : ''
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()
      // ----------------------------
      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest.refresh()
    },
    // 获取热度搜索关键字
    _getHotKey () {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          // js的slice是截取,从某个索引开始 截取到某个索引(不包括最后一个)
          this.hotKey = res.data.hotkey.slice(0, 10)
          // console.log(this.hotKey)
        }
      })
    },
    // // 清空所有历史记录  直接写在标签中, deleteSearch方法也可以, 只要传入的参数和调用vuex中方法的参数一致就可以直接写在标签中
    // clearSearch () {
    //   // 同样调用vuex中的acitions
    //   this.clearSearchHistory()
    // },
    // 点击垃圾桶 弹出确认框
    showConfirm () {
      this.$refs.confirm.show()
    },
    ...mapActions(['clearSearchHistory'])
  },
  computed: {
    shortcut () {
      return this.hotKey.concat(this.searchHistory)
    }
  },
  watch: {
    // 监听query的变化 手动刷新历史部分数据组件
    query (newQuery) {
      // 如果搜索框没有内容了,那么就刷新搜索历史的数据
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        }, 20)
      }
    }
  },
  components: {
    SearchBox,
    Suggest,
    Scroll,
    SearchList,
    Confirm
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.search {
  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;

    .shortcut {
      height: 100%;
      overflow: hidden;

      .hot-key {
        margin: 0 20px 20px 20px;

        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }

      .search-history {
        position: relative;
        margin: 0 20px;

        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;

          .text {
            flex: 1;
          }

          .clear {
            extend-click();

            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>

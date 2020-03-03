<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper">
          <div class=".slider-content">
            <!-- 判断抓取的轮播图数据是否获取完成.获取完成才渲染slider -->
            <slider ref="slider">
              <!-- 这是slider组件设置的内部插槽 -->
              <div v-for="(item,i) in recommends" :key="i">
                <a :href="item.linkUrl">
                  <img @load="loadImage" :src="item.picUrl" />
                </a>
              </div>
            </slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item,i) in discList" class="item" :key="i" @click="dics(item)">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl" />
              </div>
              <div class="text">
                <!-- v-html指令 会转义字符  实体字符需要转义-->
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import Slider from 'base/slider/slider'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { ERR_OK } from 'api/config'
import { getDiscList, getRecommend } from 'api/recommend'
import { playlistMixin } from 'assets/js/mixin'
import { mapMutations } from 'vuex'
export default {
  mixins: [playlistMixin],
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  created () {
    // 加载轮播图
    this._getRecommend()
    // 加载热门歌曲
    this._getDiscList()
  },
  activated () {
    setTimeout(() => {
      this.$refs.slider && this.$refs.slider.refresh()
    }, 20)
  },
  methods: {
    // 定义mixin中的方法 用来刷新scroll的高度,增加bottom 解决bottom覆盖页面的bug
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    // 加载热门歌曲的方法
    _getDiscList () {
      getDiscList().then(res => {
        // console.log(res.data)
        this.discList = res.data.list
      })
    },
    // 加载轮播图方法
    _getRecommend () {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    // 图片加载完成之后 刷新scroll
    loadImage () {
      // 第一次加载图片完成时刷新scroll,但是第二次再获取到时就不再刷新 避免多余的数据操作
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    },
    // 跳转到dics页面
    dics (item) {
      // console.log(item)
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      // 通过vuex来传递路由之间的数据
      this.setDisc(item)
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  // 注册组件
  components: {
    Slider,
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';

.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;

      .slider-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }

      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }

        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;

          .name {
            margin-bottom: 10px;
            color: $color-text;
          }

          .desc {
            color: $color-text-d;
          }
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

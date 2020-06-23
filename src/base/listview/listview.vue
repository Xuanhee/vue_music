<template>
  <!-- 由于scroll组件中 watch了data 属性, 所以这里必须也要 绑定data属性用来refresh scroll组件 -->
  <scroll
    @scroll="scroll"
    :listen-scroll="listenScroll"
    :probe-type="probeType"
    :data="data"
    class="listview"
    ref="listview"
  >
    <ul>
      <li class="list-group" v-for="(group,index) in data" :key="index" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li
            @click="selectItem(item)"
            class="list-group-item"
            v-for="(item,index2) in group.items"
            :key="index2"
          >
            <!-- 要用到图片懒加载 -->
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut">
      <ul>
        <li
          class="item"
          v-for="(item,index) in shortcutList"
          :key="index"
          :data-index="index"
          @touchstart.stop.prevent="onShortcutTouchstart"
          @touchmove.stop.prevent="onShortcutTouchmove"
          :class="{'current':currentIndex===index}"
        >{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixedTop">
      <!-- 这个值用计算属性去计算,这个值就是用户滚动到当前歌手分类的字母 -->
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <!-- 没有获取到数据时loading显示 -->
    <div class="loading-container" v-show="!data.length">
      <loading title="努力的加载..."></loading>
    </div>
  </scroll>
</template>
<script>
import Scroll from 'base/scroll/scroll'
// 引入封装的获取data-属性的方法
import { getData } from 'assets/js/dom'
import Loading from 'base/loading/loading'
// 设置右侧字母间的距离为18px
const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30
export default {
  created () {
    this.touch = {}
    this.listenScroll = true
    this.probeType = 3
    this.listHeight = []
  },
  // 接收传入属性
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      scrollY: -1,
      // 左右联动时显示的右侧索引位置 默认第一个
      currentIndex: 0,
      // 区域顶部字母title框的缓动向上顶(隐藏)
      diff: -1
    }
  },
  // 建立一个计算函数来记录 右侧字母
  computed: {
    shortcutList () {
      // map方法可以拿到数组中的数据
      return this.data.map(group => {
        // 因为热门只要显示一个热字,所以截取字符串第一个
        return group.title.substr(0, 1)
      })
    },
    // 用户当前字母区域 如果超出范围隐藏
    fixedTitle () {
      if (this.scrollY > 0) return ''
      // data默认是一个空数组 所以需要做一个判断
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    // 将scroll的refresh方法暴露出去
    refresh () {
      this.$refs.listview.refresh()
    },
    // 点击右侧字母时触发点击事件
    onShortcutTouchstart (e) {
      //   获取锚点index
      const anchorIndex = getData(e.target, 'index')
      const firstTouch = e.touches[0]
      //   将每次点击到的位置可以传递出去设置一个 this的属性
      //   不建议写在data() 里以为 不需要改的它,只需要获取到他而已 减少计算内存
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    // 右侧字母排序按住滑动的功能
    onShortcutTouchmove (e) {
      const firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // 这里需要向下取整, | 0 就可以做到向下取整
      const delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      // 移动的位置和第一次点击到的锚点索引进行相加 得到最新的锚点索引
      const anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    // 滚动事件的触发 获取到滚动值 最后根据滚动到的区间索引来设置高亮
    scroll (pos) {
      // console.log(pos)
      this.scrollY = pos.y
    },
    // 封装复用的 scrollToElement方法
    _scrollTo (index) {
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    // 左右联动计算高度 再数据发生变化时就触发
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      // 初始高度为0
      let height = 0
      // 高度数组中第一个数据应该为0
      this.listHeight.push(height)
      //   获取到每个模块对应的高度
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
      // 拿到的是24个数据的高度,实际上需要减2个数量因为 第一个是push的0这个必须要减  第二个是因为需要的值是索引值所以需要用长度再减1
      // console.log(this.listHeight)
    },
    // 点击歌手信息跳转到歌手详情页 将此事件派发出去 因为此组件是一个基础组件,要实现业务逻辑需要调用此组件的组件去实现
    selectItem (item) {
      // console.log(item)
      this.$emit('select', item)
      // 这里虽然可以直接跳转,但是此组件是基础组件,不要实现这些业务逻辑,需要将事件暴露出去
      // this.$router.push(`/singer/${item.id}`)
    }
  },
  watch: {
    // 监听data变化,数据有变化时计算的高度也会相应变化
    data () {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // 监听滚动的情况 来给右侧添加样式
    scrollY (newY) {
      //   console.log(newY)
      // 拿到所有分类高度的数组
      const listHeight = this.listHeight
      // 小于0的情况 滚动当顶部
      if (newY > 0) {
        this.currentIndex = 0
        // 不能忘记return
        return
      }
      // 在中间区域滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        const height1 = listHeight[i]
        const height2 = listHeight[i + 1]
        // 大于等于元素的开头,小于等于下一个元素 那么就一定是在这个区间
        if (-newY >= height1 && -newY < height2) {
          // 两个分类之间滚动显示当前分类字母
          this.currentIndex = i
          // 当前区域的区域的上限位置和已经滚动的距离差值
          this.diff = height2 + newY
          return
        }
      }
      // 最后滚动到底部  且-newY要大于元素的上限
      this.currentIndex = listHeight.length - 2
      //   console.log(this.currentIndex)
      //   console.log(listHeight.length)
    },
    diff (newY) {
      // console.log(newY)
      const fixedTop = (newY > 0 && newY < TITLE_HEIGHT) ? newY - TITLE_HEIGHT : 0
      //   让当前区域的title 字母 向上移动
      this.$refs.fixedTop.style.transform = `translate3D(0,${fixedTop}px,0)`
    }
  },
  // 注册引入的组件
  components: {
    Scroll,
    Loading
  }
}
</script>
<style lang="stylus">
@import '~assets/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
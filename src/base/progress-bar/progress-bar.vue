<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.prevent="progressTouchstart"
        @touchmove.prevent="progressTouchmove"
        @touchend="progressTouchend"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { prefixStyle } from 'assets/js/dom'
const transform = prefixStyle('transform')
// 小球的宽度(带边框)
const BTN_WIDTH = 16
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  // 在dom渲染完成之前的钩子中保存 touch对象,用来记录数据 读取数据没必要写入data中
  created () {
    this.touch = {}
  },
  methods: {
    progressTouchstart (e) {
      this.touch.flag = true
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
      this.touch.width = this.$refs.progressBar.clientWidth - BTN_WIDTH
    },
    progressTouchmove (e) {
      // 防止直接进入移动状态
      if (!this.touch.flag) return
      // 拿到最新的移动距离和初始点击距离的偏移量
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 再加上点击时已经移动的宽度 最新数据必须大于0 小于总宽度
      const offsetWidth = Math.min(this.touch.width, Math.max(0, (deltaX + this.touch.left)))
      this._offset(offsetWidth)
    },
    // 移动小球球实现 拖拽进度条功能
    progressTouchend () {
      this.touch.flag = false
      this._triggerPercent()
    },
    // 点击滚动条移动到目标位置
    progressClick (e) {
      // 该函数返回一个Object对象，该对象有6个属性：top,lef,right,bottom,width,height
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - BTN_WIDTH, Math.max(0, e.pageX - rect.left))
      //   对点击的位置进行优化,限制范围在0-总长度之间
      this._offset(offsetWidth)
      this._triggerPercent()
    },
    // 获取拖动之后的最新当前播放和总时长的比例
    _triggerPercent () {
      //   基础组件只实现功能不做业务逻辑  所以派发出去获取最新播放的事件
      this.$emit('percentChange', this.getPercent())
    },
    // 封装进度条的宽度
    setProgressOffset (percent) {
      //  // 播放器总长度 要减去小球的宽度 这样只位移小球以左的距离
      //   console.log(progressBtn.clientWidth) clientWidth 只能拿到宽度不能拿到padding和margin的距离
      if (percent > 0 && !this.touch.flag) {
        const width = this.$refs.progressBar.clientWidth - BTN_WIDTH
        //   设置进度条宽度
        const offsetWidth = percent * width
        this._offset(offsetWidth)
      }
    },
    // 封装获取读取条和总长度的比例
    getPercent () {
      // 先拿到总长度
      const barWidth = this.$refs.progressBar.clientWidth - BTN_WIDTH
      // 再拿到当前滚动的宽度
      const progressWidth = this.$refs.progress.clientWidth
      // 相除拿到最新比例
      return progressWidth / barWidth
    },
    // 封装移动位置的函数
    _offset (offsetWidth) {
      //   设置位移距离给进度条宽度  和 小球位移距离
      this.$refs.progress.style.width = offsetWidth + 'px'
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    }
  },
  watch: {
    // 监听当前播放和总时长比例  从而计算出当前播放的位置
    percent (newPercent) {
      this.setProgressOffset(newPercent)
    }
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';

.progress-bar {
  height: 30px;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>

<template>
  <transition name="drop">
    <div class="top-tip" v-show="showFlag" @click.stop="hide">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    // 可以从外部接收一个延迟时间
    delay: {
      type: Number,
      default: 800
    }
  },
  data () {
    return {
      showFlag: false
    }
  },
  methods: {
    // 显示
    show () {
      this.showFlag = true
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        // 延迟隐藏
        this.hide()
      }, this.delay)
    },
    // 隐藏
    hide () {
      this.showFlag = false
    }
  }
}
</script>

<style lang="stylus">
@import '~assets/stylus/variable.styl';

.top-tip {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 500;
  background: $color-dialog-background;

  &.drop-enter-active, &.drop-leave-active {
    transition: all 0.3s;
  }

  &.drop-enter, &.drop-leave-to {
    transform: translate3d(0, -100%, 0);
  }
}
</style>
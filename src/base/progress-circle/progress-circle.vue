<template>
  <div class="progress-circle">
    <svg
      :width="radius"
      :height="radius"
      viewBox="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 第一个圆是基础圆 -->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent" />
      <!-- 第二个圆做高亮效果 -->
      <circle
        class="progress-bar"
        r="50"
        cx="50"
        cy="50"
        fill="transparent"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashoffset"
      />
    </svg>
    <slot></slot>
  </div>
</template>
<script>
export default {
  props: {
    // 可以从父组件获取到想要的圆的大小 默认是50px
    radius: {
      type: Number,
      default: 50
    },
    percent: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      dashArray: Math.PI * 100
    }
  },
  computed: {
    dashoffset () {
      return (1 - this.percent) * this.dashArray
    }
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';

.progress-circle {
  position: relative;

  circle {
    stroke-width: 8px;
    transform-origin: center;

    // stroke 描边颜色
    &.progress-background {
      transform: scale(0.9);
      stroke: $color-theme-d;
    }

    &.progress-bar {
      transform: scale(0.9) rotate(-90deg);
      stroke: $color-theme;
    }
  }
}
</style>
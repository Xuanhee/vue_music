<template>
  <ul class="switches">
    <li
      class="switch-item"
      v-for="(item,i) in switches"
      :key="i"
      :class="{'active': currentIndex === i}"
      @click="selectSwitch(i)"
    >
      <span>{{item.name}}</span>
    </li>
  </ul>
</template>
<script>
export default {
  props: {
    //   判断当前点击是哪个,哪个显示高亮
    currentIndex: {
      type: Number,
      default: 0
    },
    // 接收一个开关数组
    switches: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    // 点击切换播放历史或者 搜索历史
    selectSwitch (index) {
      this.$emit('selectSwitch', index)
    }
  }
}
</script>
<style scoped lang="stylus">
@import '~assets/stylus/variable.styl';

.switches {
  display: flex;
  align-items: center;
  width: 240px;
  margin: 0 auto;
  border: 1px solid $color-heighlight-background;
  border-radius: 5px;

  .switch-item {
    flex: 1;
    padding: 8px;
    text-align: center;
    font-size: $font-size-medium;
    color: $color-text-d;

    &.active {
      background: $color-highlight-background;
      color: $color-text;
    }
  }
}
</style>
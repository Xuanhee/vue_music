<template>
  <div id="app">
    <m-header></m-header>
    <m-tab></m-tab>
    <!-- 将dom缓存到内存中 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from './components/m-header/m-header'
import MTab from './components/tab/tab'
import Player from './components/player/player'
export default {
  // 注册组件 m-header
  components: {
    MHeader,
    MTab,
    Player
  }
}
</script>

<style lang="stylus">
// 引入字体颜色规范文件
@import 'assets/stylus/variable.styl';

#app {
  color: $color-theme;
}
</style>

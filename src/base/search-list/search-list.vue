<template>
  <div class="search-list" v-show="searchHistory.length">
    <transition-group tag="ul" name="list">
      <li class="search-item" v-for="item in searchHistory" :key="item" @click="selectItem(item)">
        <span class="text">{{item}}</span>
        <span class="icon" @click.stop="deleteItem(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: {
    searchHistory: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    //   点击搜索历史内容添加搜索框中并出现内容 事件派发出去
    selectItem (item) {
      this.$emit('select', item)
    },
    // 点击删除按钮派发出去事件
    deleteItem (item) {
      this.$emit('delete', item)
    }
  }
}
</script>
<style scoped lang="stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.search-list {
  .search-item {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;

    &.list-enter-active, &.list-leave-active {
      transition: all 0.3s;
    }

    &.list-enter, &.list-leave-to {
      height: 0;
    }

    .text {
      flex: 1;
      color: $color-text-l;
    }

    .icon {
      extend-click();

      .icon-delete {
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
  }
}
</style>
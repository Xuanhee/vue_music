<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" v-model="query" class="box" :placeholder="placeholder" />
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script>
import { debounce } from 'assets/js/util'
export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  methods: {
    // 点击叉叉删除搜索框所有内容
    clear () {
      this.query = ''
    },
    // 设置搜索框内容,可以从外部父组件引用到此方法
    setQuery (query) {
      this.query = query
    },
    // 失去焦点
    blur () {
      this.$refs.query.blur()
    }
  },
  created () {
    // 监听搜索框值 query的变化,派发出去一个query事件
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    }, 200))
  }
  // 这样不能调用函数进行包裹
  // watch: {
  //   query (newQuery) {
  //     debounce((newQuery) => {
  //       console.log(1)
  //       this.$emit('query', newQuery)
  //     }, 200)
  //   }
  // }
}
</script>

<style lang="stylus">
@import '~assets/stylus/variable';

.search-box {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;
  border-radius: 6px;

  .icon-search {
    font-size: 24px;
    color: $color-background;
  }

  .box {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    outline-color: skyblue;

    &::placeholder {
      color: $color-text-d;
    }
  }

  .icon-dismiss {
    font-size: 16px;
    color: $color-background;
  }
}
</style>
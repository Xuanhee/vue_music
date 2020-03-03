<template>
  <div class="song-list">
    <ul>
      <li class="item" v-for="(song,i) in songs" :key="i" @click="selectItem(song,i)">
        <div class="rank" v-show="rank">
          <div :class="showRank(i)">{{rankText(i)}}</div>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    songs: {
      type: Array,
      default () {
        return []
      }
    },
    rank: {
      types: Boolean,
      default: false
    }
  },
  methods: {
    getDesc (song) {
      return `${song.singer} - ${song.album}`
    },
    // 基础组件不做业务逻辑,当有用户点击歌曲列表的某个歌曲时,那肯定需要播放了,但是此播放行为不能再基础组件中执行,基础组件只需要将数据传递出去即可
    selectItem (song, i) {
      // 向所有要调用本组件的父组件派发点击歌曲事件 传递歌曲和索引
      this.$emit('select', song, i)
    },
    // 传入一个索引,获取到前三显示奖杯,添加class 三名之后统一添加text类名
    showRank (index) {
      if (index <= 2) {
        return `icon icon${index}`
      } else {
        return 'text'
      }
    },
    // 根据传入的所以返回排名值
    rankText (index) {
      if (index > 2) {
        return index + 1
      }
    }
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.song-list {
  .item {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 64px;
    font-size: $font-size-medium;

    .rank {
      flex: 0 0 25px;
      width: 25px;
      margin-right: 30px;
      text-align: center;

      .icon {
        display: inline-block;
        width: 25px;
        height: 24px;
        background-size: 25px 24px;

        &.icon0 {
          bg-image('first');
        }

        &.icon1 {
          bg-image('second');
        }

        &.icon2 {
          bg-image('third');
        }
      }

      .text {
        color: $color-theme;
        font-size: $font-size-large;
      }
    }

    .content {
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        no-wrap();
        color: $color-text;
      }

      .desc {
        no-wrap();
        margin-top: 4px;
        color: $color-text-d;
      }
    }
  }
}
</style>

<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="modeIcon" @click="modeChange"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="clear">
              <i class="icon-clear"></i>
            </span>
            <span class="close" @click="close">
              <i class="icon-delete"></i>
            </span>
          </h1>
        </div>
        <scroll class="list-content" ref="listContent" :data="sequenceList">
          <transition-group name="list" tag="ul" ref="list">
            <li class="item" v-for="(item,i) in sequenceList" :key="item.id" ref="listItem">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text" @click="playSong(item,i)">{{item.name}}</span>
              <span class="like" @click="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click="deleteItem(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate" @click="showAddSong">
          <div class="add">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到列表</span>
          </div>
        </div>
      </div>
      <confirm @confirm="confirmClear" ref="confirm" title="您确定要清空列表吗?"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>
<script>
import { mapActions } from 'vuex'
import { playMode } from 'assets/js/config'
import Scroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
import AddSong from 'components/add-song/add-song'
import { playerMixin } from 'assets/js/mixin'
export default {
  mixins: [playerMixin],
  data () {
    return {
      showFlag: false
    }
  },
  computed: {
    modeText () {
      return this.mode === playMode.random ? '随机播放' : this.mode === playMode.sequence ? '顺序播放' : '单曲播放'
    }
  },
  methods: {
    show () {
      this.showFlag = true
      setTimeout(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrent(this.currentSong)
      }, 20)
    },
    hide () {
      this.showFlag = false
    },
    close () {
      this.hide()
    },
    // 点击歌曲进行播放
    playSong (item, index) {
      if (this.mode === playMode.random) {
        index = this.playList.findIndex((song) => {
          return song.id === item.id
        })
      }
      this.setCurrentIndex(index)
      this.setPlayState(true)
    },
    // 获取当前播放歌曲的图片  根据点击歌曲获得的来设置图标
    getCurrentIcon (item) {
      // 如果当前播放歌曲和标签中item的id相同,那么就添加类名
      if (this.currentSong.id === item.id) {
        return 'icon-play'
      }
      return ''
    },
    // 封装一个滚动当前歌曲的方法
    scrollToCurrent (current) {
      // 获取当前播放索引
      const index = this.sequenceList.findIndex((song) => {
        return song.id === current.id
      })
      // 始终保持点击列表中的的歌曲滚动在第一个
      this.$refs.listContent.scrollToElement(this.$refs.list.$el.children[index], 300)
    },
    // 点击删除列表中的歌曲
    deleteItem (item) {
      // 设置一个标识符 节流
      if (item.deleting) return
      item.deleting = true
      this.deleteSong(item)
      // 如果删除完所有列表的内容,必须要要隐藏列表
      if (!this.playList.length) {
        this.hide()
      }
      setTimeout(() => {
        item.deleting = false
      }, 300)
    },
    // 点击垃圾桶弹出对话框
    clear () {
      this.$refs.confirm.show()
    },
    // 点击对话框的确定按钮,清空所有列表
    confirmClear () {
      this.clearSong()
      // 删除完成之后,播放列表页需要隐藏
      this.hide()
    },
    showAddSong () {
      this.$refs.addSong.show()
    },
    ...mapActions(['deleteSong', 'clearSong'])
  },
  watch: {
    currentSong (newSong, oldSong) {
      // 如果列表组件不显示,或者没有切换歌曲,那么什么都不做
      if (!this.showFlag || newSong.id === oldSong.id) return
      // 始终将当前播放歌曲显示在列表的第一个
      this.scrollToCurrent(newSong)
    }
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  }
}
</script>
<style scoped lang="stylus">
@import '~assets/stylus/variable';
@import '~assets/stylus/mixin';

.playlist {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;

  &.list-fade-enter-active, &.list-fade-leave-active {
    transition: opacity 0.3s;

    .list-wrapper {
      transition: all 0.3s;
    }
  }

  &.list-fade-enter, &.list-fade-leave-to {
    opacity: 0;

    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }

  &.list-fade-enter, .list-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $color-highlight-background;

    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;

      .title {
        display: flex;
        align-items: center;

        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .clear {
          extend-click();
          margin-right: 32px;

          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }

    .close {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 5px;

      .icon-delete {
        font-size: $font-size-medium;
        color: $color-text-d;
      }
    }

    .list-content {
      max-height: 240px;
      overflow: hidden;

      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 20px;
        overflow: hidden;

        &.list-leave-active {
          animation: delete 0.5s;
        }

        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          no-wrap();
          font-size: $font-size-medium;
          color: $color-text-d;
        }

        .like {
          extend-click();
          margin-right: 22px;
          font-size: $font-size-small;
          color: $color-theme;

          .icon-favorite {
            color: $color-sub-theme;
          }
        }

        .delete {
          extend-click();
          font-size: $font-size-small;
          color: $color-theme;
        }
      }
    }

    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;

      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-text-l;
        border-radius: 100px;
        color: $color-text-l;

        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }

        .text {
          font-size: $font-size-small;
        }
      }
    }

    .list-close {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}

@keyframes delete {
  0% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(-8%, 0, 0) scale(1.2);
  }

  100% {
    transform: translate3d(100%, 0, 0) scale(1);
  }
}
</style>

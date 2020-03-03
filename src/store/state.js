import {
  playMode
} from 'assets/js/config'
import {
  loadStorage,
  loadPlay,
  loadFavorite
} from 'assets/js/catch'
const state = {
  // 歌手信息数据
  singer: {},
  // -------播放器相关数据------
  // 是否播放
  playing: false,
  // 播放器展开或收起
  fullScreen: false,
  // 播放列表
  playList: [],
  // 顺序列表- 顺序, 随机,循环 根据mode来变化
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前播放的索引,有索引和播放列表就可以计算出播放的歌曲,所以不需要直接设置播放的歌曲
  currentIndex: -1,
  disc: {},
  musicList: {},
  searchHistory: loadStorage(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
}
export default state

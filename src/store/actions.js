import * as types from './mutation-types'
import {
  shuffle
} from 'assets/js/util'
import {
  playMode
} from 'assets/js/config'
import {
  savaSearch,
  deleteSearch,
  clearSearch,
  savePlay,
  savaFavorite,
  deleteFavorite
} from 'assets/js/catch'
// 通过此函数可以找到随机播放列表中指定歌曲的索引
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
// 解构context对象 点击歌曲后更改的vuex参数
export const selectPlay = function ({
  commit,
  state
}, {
  list,
  index
}) {
  // 如果用户在点击歌曲时候,如果模式在随机播放模式了,那么在新点进的歌手的歌曲也要随机播放
  if (playMode.random === state.mode) {
    const randomList = shuffle(list)
    commit(types.SET_PLAY_LIST, randomList)
    // 随机播放之后传入的索引对应的歌曲就发生了变化,就会导致点击目标歌曲播放其他歌曲的情况
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAY_LIST, list)
  }
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
// 点击随机播放按钮修改的参数
export const randomPlay = function ({
  commit
}, {
  list
}) {
  const randomList = shuffle(list)
  commit(types.SET_MODE, playMode.random)
  commit(types.SET_PLAY_LIST, randomList)
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({
  commit,
  state
}, song) {
  let currentIndex = state.currentIndex
  // 拿到当前播放列表
  const playlist = [...state.playList]
  // 查找当前歌曲是否存在歌单中
  const playIndex = findIndex(playlist, song)
  // 在播放列表中拿到上一首播放的歌曲 本次的还没提交所以vuex存放的是上次数据
  const currentSong = playlist[currentIndex]
  // 没有歌曲在列表则添加歌曲
  if (playIndex === -1) {
    // 在当前播放列表下顺序添加歌曲
    // 添加序号加1
    currentIndex++
    playlist.splice(currentIndex, 0, song)
  } else {
    // 如果列表中有歌曲,那么就跳去列表中播放歌曲,不做操作
    currentIndex = playIndex
  }
  // 拿到顺序播放列表
  const sequenceList = [...state.sequenceList]
  // 找到上一首歌播放歌曲的索引
  let cSIndex = findIndex(sequenceList, currentSong)
  // 拿到要添加的歌曲索引
  const sequenceIndex = findIndex(sequenceList, song)
  // -1表示列表中没有歌曲 那么添加歌曲到列表第一个
  if (sequenceIndex === -1) {
    // 在上一首歌下面添加
    cSIndex++
    sequenceList.splice(cSIndex, 0, song)
  }
  // 提交点击搜索框内歌曲要更改的数据
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_PLAY_LIST, playlist)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_FULL_SCREEN, true)
}

export const savaSearchHistory = function ({
  commit
}, query) {
  // 点击搜索记录后到此方法,此方法保存最新的历史记录到浏览器记录中
  commit(types.SET_SEARCH_HISTORY, savaSearch(query))
}

export const deleteSearchHistory = function ({
  commit
}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({
  commit
}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({
  commit,
  state
}, song) {
  // 当前播放列表
  const playlist = state.playList.slice()
  // 获取当前顺序列表
  const sequenceList = state.sequenceList.slice()
  // 当前播放的索引
  let currentIndex = state.currentIndex
  // 要删除的歌曲的索引
  const sIndex = findIndex(sequenceList, song)
  // 找到要删除的歌曲在顺序列表中的索引
  const pIndex = findIndex(playlist, song)
  // 删除歌曲
  playlist.splice(pIndex, 1)
  // 同样删除歌曲
  sequenceList.splice(sIndex, 1)
  // 比较当前播放歌曲的索引和删除歌曲的索引的大小
  // 当前播放歌曲的索引大于删除歌曲,或者当前播放歌曲的索引是最后一首歌
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    // 当前播放索引需要减-,因为在他前面的歌曲被删了 为了索引不变必须减一
    currentIndex--
    // 如果删除的歌的索引和播放歌的索引相同,索引不变,只改变播放状态
  } else if (currentIndex === pIndex) {
    commit(types.SET_PLAYING_STATE, true)
  }

  // 如果删除完所有歌曲了,那么停止播放
  if (!sequenceList.length) {
    commit(types.SET_PLAYING_STATE, false)
  }
  commit(types.SET_PLAY_LIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
}

// 清空所有播放列表 实际就是清空列表内容,停止播放
export const clearSong = function ({
  commit
}) {
  commit(types.SET_PLAY_LIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}
// 保存播放歌曲到本地播放列表中 同时同步vuex中的数据
export const savaPlayHistory = function ({
  commit
}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}
// 保存喜欢的歌曲 将本地数据同步到vuex
export const savaFavoriteSong = function ({
  commit
}, song) {
  commit(types.SET_FAVORITE_LIST, savaFavorite(song))
}
// 保存删除后的喜欢的歌曲
export const deleteFavoriteSong = function ({
  commit
}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}

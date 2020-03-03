// 保存storage相关的方法
import storage from 'good-storage'
// 定义存放在storage中的key
const SEARCH_KEY = '__search__'
const PLAY_KEY = '__play__'
const FAVORITE_KEY = '__favorite__'
// 最多保存数量
const SEARCH_MAX_LENGTH = 15
const PLAY_MAX_LENGTH = 200
const FAVORITE_MAX_LENGTH = 1000
// 复用的插入函数 历史记录的数组, 搜索框的值, 比较函数, 最大保存数量
function insertArray(arr, val, compare, maxLen) {
  // 比较函数由调用者去设置 这样更加灵活
  const index = arr.findIndex(compare)
  //   如果数据存在并且是第一个那么不做任何操作
  if (index === 0) return
  if (index > 0) {
    // 如果数据存在并且还不再第一个,那就删除,目的是将历史记录最新的放在第一个
    arr.splice(index, 1)
  }
  // 将数据插入到第一个
  arr.unshift(val)
  // 如果数据总数比最大存储量要大,那么删除最后一个数据
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}
// 保存历史记录的方法 拿到输入框内容,拿到一个函数,再拿到最大保存数量
export function savaSearch(query) {
  const searches = storage.get(SEARCH_KEY, [])
  // 调用插入搜索历史的方法
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  // 最新的搜索历史插入到浏览器历史列表中
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 向外暴露出 获取当前浏览器存储SEARCH_KEY 内容的方法,外部需要查看的时候直接调用此方法即可
export function loadStorage() {
  return storage.get(SEARCH_KEY, [])
}

// 删除操作
function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    // 如果数组中有这个元素,那么就删除该元素
    arr.splice(index, 1)
  }
}

export function deleteSearch(query) {
  const searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

export function savePlay(song) {
  // 拿到存放在本地的播放历史
  const playlist = storage.get(PLAY_KEY, [])
  // 保存播放历史
  insertArray(playlist, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, playlist)
  return playlist
}

// 获取存放本地的播放记录
export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

// 保存喜欢歌曲到本地
export function savaFavorite(song) {
  const favoriteList = storage.get(FAVORITE_KEY, [])
  insertArray(favoriteList, song, (item) => {
    return item.id === song.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, favoriteList)
  return favoriteList
}

// 从本地删除喜欢的歌曲
export function deleteFavorite(song) {
  const favoriteList = storage.get(FAVORITE_KEY, [])
  deleteFromArray(favoriteList, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, favoriteList)
  return favoriteList
}

// 获取本地存储的喜欢的歌曲
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}

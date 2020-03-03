import {
  getSongsUrl,
  getLyric
} from 'api/song'
import {
  ERR_OK
} from '../../api/config'
import {
  Base64
} from 'js-base64'

// 封装歌手详情类(歌手的所有歌曲)
export default class Song {
  constructor({
    id,
    mid,
    singer,
    name,
    album,
    duration,
    image,
    url
  }) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }

  getLyric() {
    // 如果有歌词属性了,就直接返回
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }
    // 虽然getLyric也是一个Promise对象,但是这里需要对Promise对象做一个reject
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        // 用Promise包起来的话可以在 res.code 不为0的时候跳转到 reject
        if (res.code === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject(new Error('no lyric'))
        }
      })
    })
  }
}

// 对歌手详情类再进行处理 返回一个song的实例 包含所有数据信息
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    // singer有可能是多个,多个singer用/ 分隔
    singer: flitterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: musicData.url
  })
}

function flitterSinger(singer) {
  const ret = []
  // 做一个边界处理避免报错 如果没有singer数据 返回''
  if (!singer) return ''
  singer.forEach(s => {
    ret.push(s.name)
  })
  return ret.join('/')
}

// 判断是否可以添加到歌曲列表中
export function isValidMusic(musicData) {
  // 歌曲存在id 并且 是免费的
  return musicData.songid && musicData.albummid && (!musicData.pay || musicData.pay.payalbumprice === 0)
}

// 对获取到的免费歌曲列表进行url的设置
export function processSongsUrl(songs) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }
  return getSongsUrl(songs).then((purlMap) => {
    // console.log(purlMap)
    songs = songs.filter((song) => {
      const purl = purlMap[song.mid]
      if (purl) {
        song.url = purl.indexOf('http') === -1 ? `http://dl.stream.qqmusic.qq.com/${purl}` : purl
        return true
      }
      return false
    })
    return songs
  })
}

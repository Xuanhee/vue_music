// 封装的歌手类,包含歌手的id 姓名 和歌手封片地址
export default class Singer {
  constructor(id, name) {
    this.id = id
    this.name = name
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${id}.jpg?max_age=2592000`
  }
}

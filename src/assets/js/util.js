// 洗牌函数
export function shuffle(arr) {
  // 直接操作传进来的数组会改变原数组, 所以这里要拿到一个浅拷贝的数组 操作这个新的数组
  const _arr = [...arr]
  for (let i = 0; i < _arr.length; i++) {
    // 打乱数组 拿到随机索引
    const j = getRandomInt(0, _arr.length - 1)
    // 对两个数进行兑换
    const a = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = a
  }
  return _arr
}
// 借助一个函数来获取到两数之间随机值
function getRandomInt(min, max) {
  // 因为Math.random 不包含最大值,所以要加1  然后要取随机数从0到传入的最大值,所以计算相差的值要再加一个最小值
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 节流函数调用此函数返回另外一个函数，目的是延迟func函数delay时间执行
export function debounce(func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

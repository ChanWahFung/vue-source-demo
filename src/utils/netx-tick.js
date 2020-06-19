const callbacks = [] // 任务队列
let pending = false

// 执行队列任务
function flushCallbacks() {
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]()
  }
  // 初始化状态  等待下一轮执行
  pending = false
  callbacks.length = 0
}

let timerFunc

// 源码中会对执行任务机制 进行降级处理
// Promise > MutationObserver > setImmediate > setTimeout
if (typeof Promise !== 'undefined') {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb, ctx) {
  callbacks.push(() => cb.call(ctx))
  // pending标识 防止多次触发
  if (!pending) {
    pending = true
    timerFunc()
  }
}
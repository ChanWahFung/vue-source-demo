import {nextTick} from '../utils/netx-tick.js'

let has = {} // 用作 watcher 去重
let queue = [] // watcher 队列

// 执行队列任务
function flushSchedulerQueue() {
  for (let i = 0; i < queue.length; i++) {
    queue[i].run()
  }
  has = {}
  queue = []
}

export function queueWatcher(watcher) {
  let id = watcher.id
  // watcher 去重
  if (!has[id]) {
    has[id] = true
    queue.push(watcher)
    // 异步更新
    nextTick(flushSchedulerQueue)
  }
}
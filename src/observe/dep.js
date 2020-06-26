let id = 0

class Dep{
  constructor() {
    this.id = ++id
    this.subs = []
  }
  depend() {
    // watcher 添加当前 dep
    // 同时让 dep 添加 watcher
    Dep.target.addDep(this)
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  // watcher 更新
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null
let stack = []  // 存储 watcher 的栈

export function pushTarget(watcher) {
  stack.push(watcher)
  Dep.target = watcher
} 

export function popTarget(){
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep
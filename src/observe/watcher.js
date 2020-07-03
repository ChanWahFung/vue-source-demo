import {pushTarget, popTarget} from './dep.js'
import {queueWatcher} from './scheduler.js'
import {parsePath} from '../utils/index.js'
import {traverse} from './traverse.js'

let id = 0

class Watcher {
  constructor(vm, exprOrFn, cb, options){
    this.id = ++id  // watcher 唯一标识
    this.vm = vm
    this.cb = cb

    if (options) {
      this.user = !!options.user
      this.deep = !!options.deep
      // 缓存标识
      this.lazy = !!options.lazy
    } else {
      this.user = this.lazy = this.deep = false
    }
    
    this.dirty = this.lazy

    this.deps = []
    this.depIds = new Set()

    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    } else {
      // 解析 watch 的 key
      this.getter = parsePath(exprOrFn)
    }

    this.value = this.lazy ? undefined : this.get()
  }
  run() {
    const value = this.get()
    const oldValue = this.value
    this.value = value
    if (this.user) {
      this.cb.call(this.vm, value, oldValue)
    }
  }
  get() {
    const vm = this.vm
    // 1. pushTarget 将当前 watcher 记录到 Dep.target，Dep.target 是全局唯一的
    pushTarget(this)
    // 2. 调用 this.getter 相当于会执行 vm._render 函数，对实例上的属性取值，
    //由此触发 Object.defineProperty 的 get 方法，在 get 方法内进行依赖收集（dep.depend），这里依赖收集就需要用到 Dep.target
    let value = this.getter.call(vm, vm)
    // 深度监听 watch
    if (this.deep) {
      traverse(value)
    }
    // 3. popTarget 将 Dep.target 置空
    popTarget(this)
    return value
  }
  addDep(dep) {
    // 防止重复添加 dep
    if (!this.depIds.has(dep.id)) {
      this.depIds.add(dep.id)
      this.deps.push(dep)
      dep.addSub(this) // 让 dep 添加 watcher
    }
  }
  // 更新 重新渲染页面
  update() {
    if (this.lazy) {
      this.dirty = true
    } else {
      // 这里不会立即更新  而是加入队列中异步更新
      queueWatcher(this)
    }
  }
  // 计算属性求值
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  teardown() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }
}

export default Watcher
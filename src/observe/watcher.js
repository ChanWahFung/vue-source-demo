import {pushTarget, popTarget} from './dep.js'
import {queueWatcher} from './scheduler.js'

let id = 0

export class Watcher {
  constructor(vm, exprOrFn, cb, options){
    this.id = ++id  // watcher 唯一标识
    this.vm = vm
    this.cb = cb
    this.options = options
    this.getter = exprOrFn

    this.deps = []
    this.depIds = new Set()

    this.get()
  }
  run() {
    this.get()
  }
  get() {
    // 1. pushTarget 将当前 watcher 记录到 Dep.target，Dep.target 是全局唯一的
    pushTarget(this)
    // 2. 调用 this.getter 相当于会执行 vm._render 函数，对实例上的属性取值，
    //由此触发 Object.defineProperty 的 get 方法，在 get 方法内进行依赖收集（dep.depend），这里依赖收集就需要用到 Dep.target
    this.getter()
    // 3. popTarget 将 Dep.target 置空
    popTarget(this)
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
    // 这里不会立即更新  而是加入队列中异步更新
    queueWatcher(this)
  }
}
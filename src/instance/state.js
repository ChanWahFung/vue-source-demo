import {observe} from '../observe/index.js'
import {isObject} from '../utils/index.js'
import Watcher from '../observe/watcher.js'
import Dep from '../observe/dep.js'

const noop = function() {}

// 数据劫持的属性描述对象
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function initState(vm){
  const options = vm.$options
  if (options.data) {
    initData(vm)
  }
  if (options.computed) {
    initComputed(vm)
  }
  if (options.watch) {
    initWatch(vm)
  }
}

function initData(vm){
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      proxy(vm, '_data', key)
    }
  }
  // 观察数据
  observe(data)
}

function proxy(target, property, key) {
  Object.defineProperty(target, key, {
    get() {
      return target[property][key]
    },
    set(newVal) {
      return target[property][key] = newVal
    }
  })
}

function initComputed(vm) {
  const computed = vm.$options.computed
  // 存储 计算属性watcher
  const watchers = vm._computedWatchers = Object.create(null)
  for (const key in computed) {
    const userDef = computed[key]
    // 获取计算属性getter函数
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 创建 计算属性watcher
    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      {lazy: true} // 缓存标识
    )
    if (!(key in vm)) {
      definedComputed(vm, key, userDef)
    } 
  }
}

function definedComputed(vm, key, userDef) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get ? createComputedGetter(key) : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  // 计算属性数据劫持
  Object.defineProperty(vm, key, sharedPropertyDefinition)
}

function createComputedGetter(key) {
  // 这里就是计算属性被获取时触发的 get
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) { // 计算属性  实现缓存机制
      // 计算属性求值
      if (watcher.dirty) {
        // watcher 执行 get
        // 把当前 watcher 挂载到 Dep.target
        // 计算属性求值，计算属性依赖的属性触发 get 拦截回调，收集到计算属性 watcher
        watcher.evaluate()  // 计算属性求值
      }
      // 顺序：初始化时，$mount 已将 渲染watcher 入栈，并挂载到 Dep.target
      // 轮到 计算属性watcher 入栈，并挂载到 Dep.target，此时栈中为 [渲染watcher, 计算属性watcher] 
      // 计算属性求值完成后 popTragte，计算属性watcher 出栈，Dep.target 设置为 渲染watcher
      // 此时这里 Dep.target 是 渲染watcher
      if (Dep.target) {
        // deps 存储的是上面的依赖属性
        // 这里是依赖属性收集 渲染watcher 此时依赖属性的 subs里 [计算属性watcher, 渲染watcher]

        // 为什么这里要收集？
        // 第一种场景：模板有用到依赖属性时，这里是属于重复收集的，但 watcher 内部会去重
        // 第二种场景：当模板上没有使用到依赖属性，那么依赖属性是不会收集 渲染watcher 的。
        // 此时依赖属性里只会有 计算属性watcher，当依赖属性被修改，只会触发 计算属性watcher 的update
        // 而计算属性的update里仅仅是 this.dirty = true，并没有立刻求值，那么计算属性也不会被更新
        // 所以这里需要收集 渲染watcher，在执行完 计算属性watcher 后，再执行 渲染watcher
        // 渲染watcher 渲染时对计算属性取值，再次触发本函数，由于上面执行 计算属性watcher 已将 dirty = true
        // 此轮会执行 watcher.evaluate()，这里才会重新计算求值，页面计算属性更新，完成！
        watcher.depend()
      }
    }
    return watcher.value
  }
}

function initWatch(vm) {
  const watch = vm.$options.watch
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler, options) {
  // 对象watch
  if (isObject(handler)) {
    options = handler
    handler = handler.handler
  }
  // 字符串watch 直接用实例上的方法
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(key, handler, options)
}

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, cb, options) {
    options = options || {}
    options.user = true
    const watcher = new Watcher(this, key, cb, options)
    // 立即调用 watch
    if (options.immediate) {
      cb.call(this, watcher.value)
    }
    return function unwatchFn() {
      watcher.teardown()
    }
  }
}
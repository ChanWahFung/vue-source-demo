import {isObject, def} from '../utils/index.js'
import {arrayMethods} from  './array.js'
import Dep from './dep'

class Observe {
  constructor(data) {
    // 为观察的对象添加 __ob__ 标识
    def(data, '__ob__', this)
    if (Array.isArray(data)) {
      protoAugment(data, arrayMethods)
      // 观察数组
      this.observeArray(data)
    } else {
      // 观察对象
      this.walk(data)
    }
  }
  walk(data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
  observeArray(data) {
    data.forEach(item => {
      observe(item)
    })
  }
}

export function observe(data) {
  if (!isObject(data)) {
    return
  }
  let ob;
  if (data.hasOwnProperty('__ob__') && data.__ob__ instanceof Observe) {
    ob = data.__ob__
  } else {
    ob = new Observe(data)
  }
  return ob
}

function protoAugment(data, arrayMethods) {
  data.__proto__ = arrayMethods
}

function defineReactive(data, key, value) {
  observe(value)
  let dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        dep.depend() // 收集依赖
      }
      return value
    },
    set(newVal) {
      if (newVal === value) {
        return
      }
      value = newVal
      // 新值有可能是对象 需要观察
      observe(newVal)
      // 同时 watcher 更新
      dep.notify()
      return value
    }
  })
}
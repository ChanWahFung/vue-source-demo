import {isObject, def} from '../utils/index.js'
import {arrayMethods} from  './array.js'
import Dep from './dep'

class Observe {
  constructor(data) {
    this.dep = new Dep()
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

function defineReactive(obj, key, value) {
  let childOb = observe(value)
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend() // 收集依赖
        // 子元素收集依赖
        // 主要应用于数组变动时会调用 ob.dep.notify()
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return value
    },
    set(newVal) {
      if (newVal === value) {
        return
      }
      value = newVal
      // 新值有可能是对象 需要观察
      // 赋值给 childOb 是因为新值可能是数组，再重新取值时为数组收集依赖
      childOb = observe(newVal)
      // 更新视图
      dep.notify()
      return value
    }
  })
}
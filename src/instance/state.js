import {observe} from '../observe/index.js'

export function initState(vm){
  const options = vm.$options
  if (options.data) {
    initData(vm)
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
export function isObject(target) {
  return typeof target === 'object' && target != null
}

export function def(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  })
}

export function parsePath(key) {
  const keys = key.split('.')
  // obj 为 vm
  return function(obj) {
    for (let i = 0,len = keys.length; i < len; i++) {
      if (!obj) return
      // 触发属性 数据劫持get 依赖收集
      obj = obj[keys[i]]
    }
    return obj
  }
}

// 合并策略

const strats = {}

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
]

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

/**
 * 合并生命周期
 * @param {Array<Funtion> | undefined} parentVal 
 * @param {Funtion} childVal 
 */
function mergeHook(parentVal, childVal) {
  if (parentVal && childVal) {
    return parentVal.concat(childVal)
  } else {
    if (childVal) {
      return [childVal]
    }
  }
  return parentVal
}

export function mergeOptions(parent, child) {
  const options = {}
  for (const key in parent) {
    mergeField(key)
  }
  for (const key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }

  function mergeField(key){
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else if (isObject(parent[key]) && isObject(child[key])) {
      options[key] = {...parent[key],...child[key]}
    } else {
      options[key] = child[key] || parent[key]
    }
  }
  return options
}
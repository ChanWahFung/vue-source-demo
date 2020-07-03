import {isObject} from '../utils/index.js'

const seenObjects = new Set()

export function traverse(value) {
  _traverse(value, seenObjects)
  seenObjects.clear()
}

function _traverse(value, seen) {
  let i, keys
  const isArray = Array.isArray(value)
  if (!isObject(value)) {
    return
  }
  if (value.__ob__) {
    let depId = value.__ob__.dep.id
    // 去重
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  if (isArray) {
    i = value.length
    while (i--) {
      _traverse(value[i], seen)
    }
  } else {
    keys = Object.keys(value)
    i = keys.length
    while (i--) {
      _traverse(value[keys[i]], seen)
    }
  }
}
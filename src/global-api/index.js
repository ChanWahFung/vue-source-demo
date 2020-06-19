import {mergeOptions} from '../utils/index.js'

export function initGlobalAPI(Vue) {
  Vue.options = {}
  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options)
  }
}
import {createElement, createTextNode} from '../vdom/create-element.js'
import {nextTick} from '../utils/netx-tick.js'

export function renderMixin(Vue) {
  Vue.prototype._render = function (){
    const vm = this
    const {render} = vm.$options
    let vnode = render.call(vm)
    return vnode
  }
  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  }
  Vue.prototype._c = function (tag, props, ...arg) {
    return createElement(tag, props, ...arg)
  }
  Vue.prototype._v = function (text) {
    return createTextNode(text)
  }
  Vue.prototype._s = function (val) {
    return val == null ? '' : (typeof val === 'object' ? JSON.stringify(val) : val)
  }
}
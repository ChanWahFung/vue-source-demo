import {initState} from './state.js'
import {compileToFunctions} from './compiler/index.js'
import {mountComponent} from './lifecycle.js'
import {mergeOptions} from './utils/index.js'
import {callHook} from './lifecycle.js'

export function initMixin(Vue){
  Vue.prototype._init = function(options) {
    const vm = this
    vm.$options = mergeOptions(this.constructor.options, options || {})
    callHook(vm, 'beforeCreate')
    // 初始化状态 数据观测
    initState(vm)
    callHook(vm, 'created')
    // 渲染模板
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this
    const opts = vm.$options
    el = vm.$el = document.querySelector(el)
    
    if (!opts.render) {
      // 获取模板
      let template = opts.template
      if (!template && el) {
        template = el.outerHTML
      }
      // 编译模板为 render 函数
      const render = compileToFunctions(template)
      opts.render = render
    }
    mountComponent(vm, el)
  }
}
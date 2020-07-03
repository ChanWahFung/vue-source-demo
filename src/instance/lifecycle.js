import Watcher from "../observe/watcher";
import {patch} from '../vdom/patch.js'

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    let vm = this
    // 虚拟dom转真实dom
    vm.$el = patch(vm.$el, vnode)
  }
}

export function mountComponent (vm, el) {
  callHook(vm, 'beforeMount')
  const updateCompoent = () => {
    // _render方法 返回 vnode
    // _render => 内部调用 options.render
    // _update => 虚拟dom转真实dom
    console.log('—————— render ——————')
    vm._update(vm._render())
  }
  // 数据变化 执行 updateCompoent
  new Watcher(vm, updateCompoent, ()=>{}, true)
  callHook(vm, 'mounted')
}

export function callHook(vm, hook) {
  let hooks = vm.$options[hook]
  if (Array.isArray(hooks)) {
    for (let index = 0; index < hooks.length; index++) {
      hooks[index].call(vm)
    }
  }
}
import {initMixin} from './init.js'
import {renderMixin} from './render.js'
import {lifecycleMixin} from './lifecycle.js'
import {initGlobalAPI} from './global-api/index.js'

function Vue(options) {
  this._init(options)
}

// 添加原型方法
initMixin(Vue) // _init
renderMixin(Vue) // _render
lifecycleMixin(Vue) // _update

// 添加静态方法 Vue.mixin
initGlobalAPI (Vue)

export default Vue
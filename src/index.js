import {initMixin} from './instance/init.js'
import {renderMixin} from './instance/render.js'
import {lifecycleMixin} from './instance/lifecycle.js'
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
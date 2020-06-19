import { createElement } from "./create-element"

export function patch(oldVnode, newVnode) {
  const isRealElemen = oldVnode.nodeType

  if (isRealElemen) { // 替换节点
    let oldElm = oldVnode
    let parentElement = oldElm.parentNode
    let el = createElm(newVnode)
    parentElement.insertBefore(el, oldElm.nextSibling)
    parentElement.removeChild(oldElm)
    return el
  } else { // diff

  }
}

function createElm(vnode) {
  if (typeof vnode.tag === 'string') {
    // 真实dom和虚拟dom做映射关系
    vnode.el = document.createElement(vnode.tag)
    // 处理节点属性
    updateProp(vnode)
    vnode.children.forEach(child=>{
      // 递归渲染子节点
      vnode.el.appendChild(createElm(child))
    })
  } else {
    vnode.el = document.createTextNode(vnode.text)
  }
  return vnode.el
}

function updateProp(vnode){
  let data = vnode.data
  if (!vnode.data) {
    return
  }
  let el = vnode.el
  for (const key in data) {
    if (key === 'style') {
      for (const styleName in data.style) {
        el.style[styleName] = data.style[styleName]
      }
    } else {
      el.setAttribute(key, data[key])
    }
  }
}
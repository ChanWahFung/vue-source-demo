const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配动态变量

// 处理属性
function genProps(attrs) {
  if (attrs.length) {
    let str = ''
    for (let index = 0; index < attrs.length; index++) {
      let attr = attrs[index]
      // style属性可能有多个  处理成对象形式
      if (attr.name === 'style') {
        let obj = {}
        attr.value.split(';').forEach(item => {
          let [key, value] = item.split(':')
          obj[key] = value
        })
        attr.value = obj
      }
      str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
  }
}

// 创建子元素
function gen(node) {
  if (node.type === 1) {
    return generate(node)
  } else if (node.type === 3) {
    let text = node.text
    // 没有变量直接返回文本
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      let match = ''
      let tokens = []
      let lastIndex = defaultTagRE.lastIndex = 0
      // 循环截取变量
      while(match = defaultTagRE.exec(text)) {
        // 变量前面的字符串 如： aaa {{msg}}
        if (match.index) {
          tokens.push(JSON.stringify(text.slice(lastIndex, match.index)))
        }
        // 变量
        tokens.push(`_s(${match[1]})`)
        lastIndex = match.index + match[0].length
      }
      if (lastIndex != text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}

// 处理子元素
function genChildren(ast) {
  const children = ast.children
  if (children.length) {
    return children.map(node => gen(node)).join(',')
  }
}

export function generate(ast) {
  // 创建标签：_c(标签, 属性, 子元素, 子元素...)
  // 创建文本：_v(文本)
  // 变量：_s(变量)
  let children = genChildren(ast)
  let code = `_c("${ast.tag}", ${genProps(ast.attrs)} ${children ? `,${children}` : ''})`
  return code
}
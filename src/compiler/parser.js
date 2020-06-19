const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >

export function parseHTML(html) {
  let root = null // 根元素
  let currentParent = null // 当前元素
  let stack = []  // 存储标签，用于检测标签闭合
  /**
   * 构建ast树
   */
  // type: 1 => 普通元素 3 => 文本元素
  function createASTElemet(tagName, attrs) {
    return {
      tag: tagName,
      attrs,
      children: [],
      parent: null,
      type: 1
    }
  }
  function start(tagName, attrs) {
    let element = createASTElemet(tagName, attrs)
    // 设置根元素
    if (!root) {
      root = element
    }
    currentParent = element
    stack.push(element)
  }
  // 确定父子关系
  function end(tagName) {
    let element = stack.pop()
    currentParent = stack[stack.length-1]
    if (currentParent) {
      element.parent = currentParent
      currentParent.children.push(element)
    }
  }
  // 将文本加入ast
  function chars(text) {
    text = text.replace(/^\s*|\s*$/g, '')
    if (text) {
      currentParent.children.push({
        type: 3,
        text
      })
    }
  }
  /**
   * 解析标签
   */
  while(html) {
    let textEnd = html.indexOf('<')
    if (textEnd === 0) {
      const startTagMatch = parseStartTag()
      // 开始标签 <div>
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
      }
      // 结束标签 </div>
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
      }
    }
    // 文本
    let text;
    if (textEnd >= 0) {
      text = html.substring(0, textEnd)
      if (text) {
        advance(text.length)
        chars(text)
      }
    }
  }
  // 截取字符串
  function advance(n) {
    html = html.substring(n)
  }
  // 解析开始标签
  function parseStartTag() {
    // 匹配标签名
    let start = html.match(startTagOpen) 
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: []
      }
      advance(start[0].length)

      let end,attr;
      // 匹配属性
      while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
        advance(attr[0].length)
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        })
      }
      // 匹配完成 去掉尾标签
      if (end) {
        advance(end[0].length)
      }
      return match
    }
  }

  return root
}
import {parseHTML} from './parser.js'
import {generate} from './generator.js'

export function compileToFunctions(template) {
  // 模板字符串转 ast
  let ast = parseHTML(template)
  // 拼接成 render 函数
  let code = generate(ast)
  let render = new Function(`with(this){return ${code}}`)
  return render
}
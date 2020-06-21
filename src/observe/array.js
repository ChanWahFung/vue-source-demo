let arrayProto = Array.prototype
export let arrayMethods = Object.create(arrayProto)

let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]

methods.forEach(method => {
  arrayMethods[method] = function(...args) {
    let res = arrayProto[method].apply(this, args)
    let ob = this.__ob__
    let inserted = ''
    switch(method){
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
    }
    // 对新增的值观测
    inserted && ob.observeArray(inserted)
    // 更新视图
    ob.dep.notify()
    return res
  }
})
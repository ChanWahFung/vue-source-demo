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
    let increased = ''
    switch(method){
      case 'push':
      case 'unshift':
        increased = args
        break;
      case 'splice':
        increased = args.slice(2)
        break;
    }
    increased && ob.observeArray(increased)
    ob.dep.notify()
    return res
  }
})
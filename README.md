# 为什么proxy中需要搭配reflect使用
```typescript
const person = {
  name: 'sanjin',
  get aliasName() {
    return this.name + 'handsome'
  }
}

let proxyPerson = new Proxy(person, {
  get(target, key, recevier) {
    console.log(key);
    // target 指被代理对象，即 person, 访问 aliasName 时 this.name 作用域是 person 不会触发代理
    // return target[key]

    // recevier 指代理对象，即 proxyPerson, 直接返回 recevier[key], 会导致循环访问
    // return recevier[key]

    // 必须使用 Reflect.get，set 同理
    return Reflect.get(target, key, recevier)
  }
})

console.log(proxyPerson.aliasName)
```
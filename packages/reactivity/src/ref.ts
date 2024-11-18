import { activeEffect, trackEffect, triggerEffects } from './effect'
import { createDep } from './reactEffect'
import { toReactive } from './reactive'

// reactive 只能使用对象，ref 可以用于基础类型的使用
// const state = reactive(object)
// const flag = ref(true)
export function ref(value) {
  return createRef(value)
}

export function createRef(value) {
  return new RefImpl(value)
}

class RefImpl {
  public __v_isRef = true // 增加 ref 标识
  public _value // 用于保存 ref 值
  public dep // 用于收集对应的 effect

  constructor(public rawValue) {
    this._value = toReactive(rawValue)
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue
      this._value = newValue
      triggerRefValue(this)
    }
  }
}

export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = ref.dep || createDep(() => (ref.dep = undefined), 'undefined'))
    )
  }
}

export function triggerRefValue(ref) {
  let dep = ref.dep
  if (dep) {
    triggerEffects(dep)
  }
}

// 直接解构 reactive 对象会丢失响应式, 需要经过 toRef或者 toRefs 转化
// 错误示例
// const state = reactive(object)
// const { xxx, aaa } = state
// 正确示例
// const xxx = toRef(state, 'xxx')
// const { xxx, aaa } = toRefs(state)
export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

class ObjectRefImpl {
  public __v_isRef = true // 增加 ref 标识
  constructor(public _object, public _key) {}

  get value() {
    return this._object[this._key]
  }
  set value(newValue) {
    this._object[this._key] = newValue
  }
}

export function toRefs(object) {
  const res = {}

  for (let key in object) {
    res[key] = toRef(object, key)
  }

  return res
}

// 在 template 中，编写ref.value比较麻烦，所以增加自动脱ref功能
export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key, receiver) {
      let r = Reflect.get(target, key, receiver)
      return r.__v_isRef ? r.value : r
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]

      if (oldValue.__v_isRef) {
        oldValue.value = value
        return true
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    },
  })
}

export function isRef(value) {
  return value && value.__v_isRef
}

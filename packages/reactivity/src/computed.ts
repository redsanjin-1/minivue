import { isFunction } from '@minivue/shared'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

class ComputedRefImpl {
  public _value
  public effect

  constructor(public getter, public setter) {
    // 创建一个 effect 来关联当前计算属性的 dirty
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        // 计算属性依赖的值变化，触发effect渲染
        triggerRefValue(this)
      }
    )
  }
  get value() {
    if (this.effect.dirty) {
      // 默认值是脏的，但是执行一次 run 就不脏了
      this._value = this.effect.run()
      trackRefValue(this)
      // 如果当前在 effect 中访问了计算属性，计算属性是可以收集这个 effect 的
    }
    return this._value
  }
  set value(value) {
    this.setter(value)
  }
}

export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions)

  let getter
  let setter
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {}
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}

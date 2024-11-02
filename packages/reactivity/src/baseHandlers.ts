import { isObject } from '@minivue/shared'
import { ReactiveFlags } from './constants'
import { track, trigger } from './reactEffect'
import { reactive } from './reactive'

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, recevier) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    // 依赖收集
    track(target, key)

    let res = Reflect.get(target, key, recevier)
    if (isObject(res)) {
      // 深度代理值
      return reactive(res)
    }

    return res
  },
  set(target, key, value, recevier) {
    let oldValue = target[key]
    let result = Reflect.set(target, key, value, recevier)
    if (oldValue !== value) {
      // 触发更新
      trigger(target, key, value, oldValue)
    }

    return result
  },
}

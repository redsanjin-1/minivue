import { isObject } from '@minivue/shared'
import { mutableHandlers } from './baseHandlers'
import { ReactiveFlags } from './constants'

// 因为 key 为对象，使用WeakMap可以防止内存泄露
export const reactiveMap = new WeakMap()

function createReactiveObject(target) {
  if (!isObject(target)) {
    return
  }
  // 取缓存
  const existProxy = reactiveMap.get(target)
  if (existProxy) {
    return existProxy
  }
  // 不能重复代理
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  let proxy = new Proxy(target, mutableHandlers)
  // 设置
  reactiveMap.set(target, proxy)

  console.log('proxy', proxy)
  return proxy
}

export function reactive(target) {
  return createReactiveObject(target)
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

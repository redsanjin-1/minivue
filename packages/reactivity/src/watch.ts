import { isFunction, isObject } from '@minivue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'
import { isRef } from './ref'

export function watch(source, cb, options = {} as any) {
  return doWatch(source, cb, options)
}
export function watchEffect(source, options = {} as any) {
  return doWatch(source, null, options)
}

function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  if (!isObject(source)) {
    return source
  }
  if (depth) {
    if (depth <= currentDepth) {
      return source
    }
    currentDepth++
  }
  if (seen.has(source)) {
    return source
  }
  for (let key in source) {
    traverse(source[key], depth, currentDepth, seen)
  }
  return source
}

function doWatch(source, cb, { deep, immediate }) {
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined)
  let getter
  let oldValue

  if (isReactive(source)) {
    getter = () => reactiveGetter(source)
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isFunction(source)) {
    getter = source
  }

  let clean
  const onCleanup = (fn) => {
    clean = () => {
      fn()
      clean = undefined
    }
  }

  const job = () => {
    if (cb) {
      const newValue = effect.run()

      if (clean) {
        clean() // 在执行回调前，先调用上一次的清理操作
      }

      cb(newValue, oldValue, onCleanup)
      oldValue = newValue
    } else {
      effect.run()
    }
  }

  const effect = new ReactiveEffect(getter, job)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    // watchEffect
    effect.run()
  }

  const unwatch = () => {
    effect.stop()
  }
  return unwatch
}

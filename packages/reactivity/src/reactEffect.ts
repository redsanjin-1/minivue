import { activeEffect, trackEffect, triggerEffects } from './effect'

const targetMap = new WeakMap() // 存放依赖收集关系

export function createDep(cleanup, key) {
  // 3.4.0之前版本是 Set ,之后为了清理操作，改为 Map
  const dep = new Map() as any
  dep.cleanup = cleanup
  dep.name = key
  return dep
}

export function track(target, key) {
  // debugger
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key))) // 后面用于清理不需要的属性
  }

  trackEffect(activeEffect, dep) // 将当前的 effect 放入到 dep 中，后续可以根据值的变化触发 dep 中存放的 effect
}

export function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  let dep = depsMap.get(key)
  if (dep) {
    triggerEffects(dep)
  }
}

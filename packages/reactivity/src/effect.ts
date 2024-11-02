export let activeEffect

function preCleanEffect(effect) {
  effect._depsLength = 0
  effect._trackId++
}
function postCleanEffect(effect) {
  // [flag, age, xxx, gg]
  // [flag]
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect)
    }
    effect.deps.length = effect._depsLength
  }
}
function cleanDepEffect(dep, effect) {
  dep.delete(effect)
  if (dep.size === 0) {
    dep.cleanup()
  }
}

class ReactiveEffect {
  _trackId = 0 // 用于记录当前 effect 执行了几次
  _running = 0 // 是否正在更新
  _depsLength = 0 // 依赖项个数
  deps = [] // 依赖项

  public active = true // 创建的 effect 是响应式的
  // fn 中依赖的数据发生变化后，需要重新调用 run()
  constructor(public fn, public scheduler) {}
  run() {
    if (!this.active) {
      return this.fn()
    }
    // 解决嵌套 effect 问题
    let lastEffect = activeEffect
    try {
      activeEffect = this

      // effect 重新执行前，需要将上一次的依赖清空
      preCleanEffect(this)
      this._running++
      return this.fn()
    } finally {
      this._running--
      // 移除多余的依赖
      postCleanEffect(this)
      activeEffect = lastEffect
    }
  }
  stop() {
    this.active = false
  }
}
export function effect(fn, options?) {
  // 创建一个响应式 effect, 数据变化后可以重新执行 fn
  const _effect = new ReactiveEffect(fn, () => {
    // 默认的调度器为直接执行
    _effect.run()
  })
  _effect.run()
  if (options) {
    Object.assign(_effect, options)
  }
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function trackEffect(effect, dep) {
  // 需要重新的去收集依赖，将不需要的移除
  // [flag, name]
  // [flag, age]
  // effect 中存在分支依赖，需要移除 name
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId) // 更新 id
    // console.log('优化了一次 effect 中多次收集同一个 effect')
    // effect(() => { console.log(state.name, state.name, state.name) })
    let oldDep = effect.deps[effect._depsLength]
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(oldDep, effect)
      }
      effect.deps[effect._depsLength++] = dep
    } else {
      effect._depsLength++
    }
  }
}
export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (!effect._running) {
      if (effect.scheduler) {
        effect.scheduler()
      }
    }
  }
}

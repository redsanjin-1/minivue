export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_REF = '__v_isRef',
  IS_COMPUTED = '__v_isComputed',
}

export enum DirtyLevels {
  Dirty = 4, // 脏值，意味着取值要运行计算属性
  NoDirty = 0, // 不脏，使用上一次的返回结果
}

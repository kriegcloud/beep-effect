class Environment {
  constructor (factories, { bind = false } = {}) {
    this._factories = factories.slice()

    for (const factory of this._factories) {
      if (typeof factory.prototype.init === 'function') {
        factory.prototype.init.call(this)
      }

      for (const method of factory.exports || []) {
        if (bind) {
          this[method] = factory.prototype[method].bind(this)
        } else {
          this[method] = factory.prototype[method]
        }
      }
    }
  }

  clone () {
    const env = new Environment(this._factories)

    for (const factory of env._factories) {
      if (typeof factory.prototype.clone === 'function') {
        factory.prototype.clone.call(env, this)
      }
    }

    return env
  }
}

export default Environment

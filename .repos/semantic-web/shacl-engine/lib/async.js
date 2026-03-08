async function every (items, func) {
  for (const item of items) {
    if (!await func(item)) {
      return false
    }
  }

  return true
}

async function filter (items, func) {
  return (await Promise.all(items.map(item => func(item)))).filter(Boolean)
}

async function map (items, func) {
  return Promise.all(items.map(func))
}

async function some (items, func) {
  for (const item of items) {
    if (await func(item)) {
      return true
    }
  }

  return false
}

export {
  every,
  filter,
  map,
  some
}

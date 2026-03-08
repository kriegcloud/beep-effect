function sort (results) {
  return results.slice().sort((a, b) => {
    const diff = b.score - a.score

    if (diff !== 0) {
      return diff
    }

    return a.term.value.localeCompare(b.term.value)
  })
}

export default sort

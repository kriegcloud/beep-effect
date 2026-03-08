function isMatch (quad, subject, predicate, object, graph) {
  if (subject && !quad.subject.equals(subject)) {
    return false
  }

  if (predicate && !quad.predicate.equals(predicate)) {
    return false
  }

  if (object && !quad.object.equals(object)) {
    return false
  }

  if (graph && !quad.graph.equals(graph)) {
    return false
  }

  return true
}

module.exports = isMatch

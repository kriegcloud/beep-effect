function dataset (dataset, toNT) {
  return [...dataset].map(quad => toNT(quad)).join('\n') + '\n'
}

export default dataset

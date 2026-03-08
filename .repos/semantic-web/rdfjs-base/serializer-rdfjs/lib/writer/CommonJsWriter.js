class CommonJsWriter {
  leadingLines () {
    return ['module.exports = ({ factory }) => {']
  }

  blankNodesLines (number) {
    return [
      '  const blankNodes = []',
      `  for (let i = 0; i < ${number}; i++) {`,
      '    blankNodes.push(f.blankNode())',
      '  }',
      ''
    ].join('\n')
  }
}

export default CommonJsWriter

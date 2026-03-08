class TypeScriptWriter {
  leadingLines () {
    return [
      'export default ({ factory }: { factory: import(\'@rdfjs/types\').DataFactory }): import(\'@rdfjs/types\').Quad[] => {'
    ]
  }

  blankNodesLines (number) {
    return [
      '  const blankNodes: import(\'@rdfjs/types\').BlankNode[] = []',
      `  for (let i = 0; i < ${number}; i++) {`,
      '    blankNodes.push(f.blankNode())',
      '  }',
      ''
    ].join('\n')
  }
}

export default TypeScriptWriter

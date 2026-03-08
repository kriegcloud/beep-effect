import prefixes from '@zazuko/prefixes'
import * as namespaces from '@tpluscode/rdf-ns-builders'
import { Project, VariableDeclarationKind } from 'ts-morph'
import { Context } from './index.js'

export function generateNamespace({ project }: { project: Project}, context: Context) {
  const nsFile = project.createSourceFile('lib/namespace.ts', {}, { overwrite: true })

  if (context.prefix in namespaces) {
    nsFile.addExportDeclaration({
      namedExports: [context.prefix],
      moduleSpecifier: '@tpluscode/rdf-ns-builders',
    })
    return
  }

  nsFile.addImportDeclaration({
    defaultImport: 'namespace',
    moduleSpecifier: '@rdfjs/namespace',
  })

  nsFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{
      name: context.prefix,
      initializer: `namespace('${prefixes[context.prefix]}')`,
    }],
    isExported: true,
  })
}

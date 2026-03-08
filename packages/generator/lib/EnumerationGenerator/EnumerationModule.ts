import { ObjectLiteralExpression, Project, SourceFile, VariableDeclarationKind } from 'ts-morph'
import { GraphPointer } from 'clownface'
import { rdf } from '@tpluscode/rdf-ns-builders'
import { Context, GeneratedModule } from '../index.js'
import { EnumerationType, TypeMetaCollection } from '../types/index.js'

export class EnumerationModule implements GeneratedModule {
  type: EnumerationType
  node: GraphPointer

  public constructor(enumeration: GraphPointer, type: EnumerationType) {
    this.node = enumeration
    this.type = type
  }

  writeModule({ project, types, context, indexModule }: {project: Project; types: TypeMetaCollection; context: Pick<Context, 'prefix' | 'log'>; indexModule: SourceFile}) {
    context.log.debug('Generating enumeration %s', this.type.name)
    const enumFile = project.createSourceFile(`lib/${this.type.module}.ts`, {}, { overwrite: true })

    const enumeration = enumFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{
        name: 'values',
        initializer: '{}',
      }],
    }).getDeclarations()[0].getInitializer()! as ObjectLiteralExpression

    this.node.in(rdf.type)
      .forEach(enumMember => {
        const memberType = types.get(enumMember)
        if (memberType?.type !== 'EnumerationMember') {
          context.log.warn('Term %s was not recognized as enumeration member', enumMember.value)
          return
        }

        context.log.debug('Adding enum member %s', memberType.prefixedName)

        enumeration.addPropertyAssignment({
          name: memberType.termName,
          initializer: memberType.prefixedName,
        })
      })

    const hasMembers = enumeration.getProperties().length > 0
    if (!hasMembers) {
      enumFile.addImportDeclaration({
        namedImports: ['NamedNode'],
        moduleSpecifier: '@rdfjs/types',
        isTypeOnly: true,
      })
    } else {
      enumFile.addImportDeclaration({
        namedImports: [context.prefix],
        moduleSpecifier: './namespace.js',
      })
    }

    enumFile.addTypeAlias({
      name: this.type.name,
      type: hasMembers ? 'typeof values[keyof typeof values]' : 'NamedNode',
      isExported: true,
    })

    enumFile.addExportAssignment({
      isExportEquals: false,
      expression: 'values',
    })

    indexModule.addExportDeclaration({
      moduleSpecifier: `./lib/${this.type.name}.js`,
    }).toNamespaceExport()
    indexModule.addExportDeclaration({
      moduleSpecifier: `./lib/${this.type.name}.js`,
      namedExports: [`default as ${this.type.name}Enum`],
    })
  }
}

import TermMap from '@rdfjs/term-map'
import { BlankNode, NamedNode, Term } from '@rdfjs/types'
import { AnyPointer } from 'clownface'
import { ModuleDeclarationKind, SourceFile, StructureKind } from 'ts-morph'
import { Context, GeneratedModule, WriteModule } from '../index.js'
import { ResourceType } from '../types/index.js'

export class FactoryModule implements GeneratedModule<ResourceType> {
  constructor(private options: { terms: TermMap<Term, AnyPointer<BlankNode | NamedNode>> }) {
  }

  writeModule({ project, context, types }: WriteModule): void {
    const factoryModule = project.createSourceFile('Factory.ts', {}, { overwrite: true })

    factoryModule.addImportDeclaration({
      moduleSpecifier: '@tpluscode/rdfine/environment',
      namedImports: ['RdfineEnvironment', 'Vocabulary'],
      isTypeOnly: true,
    })
    factoryModule.addImportDeclaration({
      moduleSpecifier: './index.js',
      namespaceImport: context.defaultExport,
    })

    factoryModule.addTypeAlias({
      kind: StructureKind.TypeAlias,
      name: `${context.defaultExport}Vocabulary`,
      type: `Vocabulary<typeof ${context.defaultExport}>`,
    })

    this.generateModuleAugmentation(factoryModule, context)
    this.generateFactory(factoryModule, context)
  }

  generateModuleAugmentation(factoryModule: SourceFile, context: Context) {
    const environmentModule = factoryModule.addModule({
      hasDeclareKeyword: true,
      name: "'@tpluscode/rdfine/environment'",
      declarationKind: ModuleDeclarationKind.Module,
    })

    environmentModule.addInterface({
      kind: StructureKind.Interface,
      name: 'Rdfine',
      properties: [{
        kind: StructureKind.PropertySignature,
        name: context.prefix,
        type: `${context.defaultExport}Vocabulary`,
      }],
    })
  }

  generateFactory(factoryModule: SourceFile, context: Context) {
    factoryModule.addClass({
      isExported: true,
      kind: StructureKind.Class,
      name: `${context.defaultExport}Factory`,
      methods: [{
        kind: StructureKind.Method,
        name: 'init',
        parameters: [{
          kind: StructureKind.Parameter,
          name: 'this',
          type: 'RdfineEnvironment',
        }],
        statements: [
          `this.rdfine.${context.prefix} = this._initVocabulary(${context.defaultExport})`,
        ],
      }],
    })
  }
}

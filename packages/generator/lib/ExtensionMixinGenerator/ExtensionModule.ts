import { ModuleDeclarationKind, Project, SourceFile, StructureKind } from 'ts-morph'
import { GraphPointer } from 'clownface'
import { shrink } from '@zazuko/prefixes'
import { ExternalResourceType, TypeMetaCollection } from '../types/index.js'
import { Context } from '../index.js'
import { JavascriptProperty } from '../property/JsProperties.js'
import { PropertyWriter } from '../property/PropertyWriter.js'
import { MixinModuleBase } from '../MixinGenerator/MixinModuleBase.js'

export class ExtensionModule extends MixinModuleBase<ExternalResourceType> {
  properties: JavascriptProperty[]
  extended: { prefix: string; term: string }
  interfaceName: string

  constructor({ domain, type }: { domain: GraphPointer; type: ExternalResourceType }) {
    super(domain, type)
    this.properties = []
    const [prefix, term] = shrink(this.node.value).split(':')
    this.extended = { prefix, term }
    this.interfaceName = `${this.extended.term}Ex`
  }

  addProperties(...properties: JavascriptProperty[]) {
    for (const property of properties) {
      this.properties.push(property)
    }
  }

  writeModule({ project, context }: { project: Project; types: TypeMetaCollection; context: Omit<Context, 'properties'>; indexModule: SourceFile }): void {
    const module = project.createSourceFile(`extensions/${this.extended.prefix}/${this.extended.term}.ts`, {}, { overwrite: true })

    context.log.debug(`Generating extension mixin for ${this.type.qualifiedName}`)

    const interfaceEx = module.addInterface({
      name: `${this.interfaceName}<D extends RDF.DatasetCore = RDF.DatasetCore>`,
    })

    this.augmentExtendedModule(module)

    const { mixinClass, mixinFunction } = this.createMixinFunction(module, context)

    const propertyWriter = new PropertyWriter({
      interfaceDeclaration: interfaceEx,
      classDeclaration: mixinClass,
      context,
      module: this,
    })
    this.properties
      .sort((left, right) => left.name.localeCompare(right.name))
      .forEach(propertyWriter.addProperty.bind(propertyWriter))

    const nsBuilderTerm = this.extended.term === this.type.localName
      ? `${this.extended.prefix}.${this.extended.term}`
      : `${this.extended.prefix}['${this.extended.term}']`
    module.addStatements([
      `${mixinFunction.getName()}.appliesTo = ${nsBuilderTerm}`,
    ])

    this.addRdfineNamespaceImport(this.type)
    this.addImports(module, context)
  }

  private augmentExtendedModule(module: SourceFile) {
    const augmentedModule = module.addModule({
      kind: StructureKind.Module,
      name: `'${this.type.module}'`,
      declarationKind: ModuleDeclarationKind.Module,
    })

    augmentedModule.addInterface({
      name: `${this.type.localName}<D extends RDF.DatasetCore>`,
      extends: [`${this.interfaceName}<D>`],
    })
  }

  private createMixinFunction(mixinFile: SourceFile, context: Omit<Context, 'properties'>) {
    const mixinFunction = mixinFile.addFunction({
      name: `${this.type.localName}MixinEx`,
      typeParameters: [{
        name: 'Base',
        constraint: `rdfine.ExtendingConstructor<${this.type.qualifiedName}, ${this.interfaceName}>`,
      }],
      parameters: [{
        name: 'Resource',
        type: 'Base',
      }],
      returnType: `rdfine.Constructor<${this.interfaceName} & RdfResourceCore> & Base`,
      isExported: true,
    })

    const mixinClass = mixinFunction.addClass({
      name: 'Impl',
      extends: 'Resource',
      implements: [this.interfaceName],
    })

    mixinClass.addDecorator({
      name: 'rdfine.namespace',
      arguments: [context.prefix],
    })

    mixinFunction.addStatements('return Impl')

    return { mixinClass, mixinFunction }
  }

  private addImports(mixinFile: SourceFile, context: Omit<Context, 'properties'>) {
    mixinFile.addImportDeclaration({
      namespaceImport: 'rdfine',
      moduleSpecifier: '@tpluscode/rdfine',
    })
    mixinFile.addImportDeclaration({
      namedImports: ['RdfResourceCore'],
      moduleSpecifier: '@tpluscode/rdfine/RdfResource',
      isTypeOnly: true,
    })

    mixinFile.addImportDeclaration({
      defaultImport: '$rdf',
      moduleSpecifier: '@rdfjs/data-model',
    })
    mixinFile.addImportDeclaration({
      namespaceImport: 'RDF',
      moduleSpecifier: '@rdfjs/types',
      isTypeOnly: true,
    })
    mixinFile.addImportDeclaration({
      namedImports: [this.extended.prefix],
      moduleSpecifier: '@tpluscode/rdf-ns-builders',
    })
    mixinFile.addImportDeclaration({
      namedImports: [context.prefix],
      moduleSpecifier: '../../lib/namespace.js',
    })
    mixinFile.addImportDeclaration({
      namespaceImport: context.defaultExport,
      moduleSpecifier: '../../index.js',
      isTypeOnly: true,
    })

    Object.entries(this.namespaceImports)
      .sort(([l], [r]) => l.localeCompare(r))
      .forEach(([moduleSpecifier, namespaceImport]) => {
        mixinFile.addImportDeclaration({
          moduleSpecifier,
          namespaceImport,
          isTypeOnly: true,
        })
      })

    this.mixinImports
      .forEach(imported => {
        if (imported.type === 'Resource') {
          mixinFile.addImportDeclaration({
            moduleSpecifier: `./${imported.localName}.js`,
            namedImports: [imported.mixinName],
          })
        } else {
          const moduleSpecifier = imported.module.startsWith('.') ? `${imported.module}.js` : imported.module
          const superImport = mixinFile.addImportDeclaration({
            moduleSpecifier,
          })

          superImport.addNamedImport({
            name: imported.exportName,
            alias: imported.mixinName,
          })
        }
      })
  }
}

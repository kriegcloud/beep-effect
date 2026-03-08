import { SourceFile, VariableDeclarationKind } from 'ts-morph'
import { GraphPointer } from 'clownface'
import { Context, GeneratedModule, WriteModule } from '../index.js'
import { ExternalResourceType, ResourceType, TypeMetaCollection } from '../types/index.js'
import { PropertyWriter } from '../property/PropertyWriter.js'
import { JavascriptProperty } from '../property/JsProperties.js'
import { ExtensionModule } from '../ExtensionMixinGenerator/ExtensionModule.js'
import { MixinModuleBase } from './MixinModuleBase.js'
import { getSuperClasses } from './index.js'

export class MixinModule extends MixinModuleBase<ResourceType> {
  superClasses: Array<ResourceType | ExternalResourceType>
  properties: JavascriptProperty[]

  public constructor(clas: GraphPointer, type: ResourceType, superClasses: (ResourceType | ExternalResourceType)[], properties: JavascriptProperty[]) {
    super(clas, type)
    this.superClasses = superClasses
    this.superClasses.forEach(this.addMixinImport.bind(this))
    this.properties = properties
  }

  writeModule({ project, types, context, indexModule, allGenerators }: WriteModule) {
    context.log.debug(`Generating mixin ${this.type.qualifiedName}`)

    const mixinFile = project.createSourceFile(`${this.type.module}.ts`, {}, { overwrite: true })
    const bundleModule = project.createSourceFile(`bundles/${this.type.term}.ts`, {}, { overwrite: true })
    const bundleIndex = project.getSourceFile('bundles/index.ts') || project.createSourceFile('bundles/index.ts', {}, { overwrite: true })

    const mixinName = this.type.mixinName
    const interfaceDeclaration = this.createInterface(mixinFile)
    const classDeclaration = this.createMixinFunction(mixinFile, allGenerators, context)

    const propertyWriter = new PropertyWriter({
      interfaceDeclaration,
      classDeclaration,
      context,
      module: this,
    })
    this.properties
      .sort((left, right) => left.name.localeCompare(right.name))
      .forEach(propertyWriter.addProperty.bind(propertyWriter))

    const type = this.type.term === this.type.localName
      ? `${context.prefix}.${this.type.term}`
      : `${context.prefix}['${this.type.term}']`

    const mixinNames = this.superClasses.reduce((mixins, sc) => {
      return [...mixins, sc.mixinName]
    }, [this.type.mixinName])

    mixinFile.addStatements([
      `${mixinName}.appliesTo = ${type}`,
    ])

    mixinFile.addStatements([
      `${mixinName}.createFactory = (env: RdfineEnvironment) => createFactory<${this.type.localName}>([${mixinNames.reverse().join(', ')}], { types: [${type}] }, env)`,
    ])

    this.addImports(mixinFile, context)
    this.generateDependenciesModule(bundleModule, bundleIndex, types)

    indexModule.addExportDeclaration({
      namedExports: [mixinName],
      moduleSpecifier: `${this.type.module}.js`,
    })

    indexModule.addExportDeclaration({
      namedExports: [this.type.localName],
      moduleSpecifier: `${this.type.module}.js`,
      isTypeOnly: true,
    })
  }

  private generateDependenciesModule(depsModule: SourceFile, bundleIndex: SourceFile, types: TypeMetaCollection) {
    const exports: string[] = []
    const imported: Map<string, ResourceType | ExternalResourceType> = new Map()
    const name = `${this.type.localName}Bundle`

    bundleIndex.addExportDeclaration({
      moduleSpecifier: `./${this.type.term}.js`,
      namedExports: [name],
    })

    depsModule.addImportDeclaration({
      namedImports: ['Mixin'],
      moduleSpecifier: '@tpluscode/rdfine/lib/ResourceFactory',
      isTypeOnly: true,
    })

    const toImport = this.properties.reduce((toImport, prop) => {
      return prop.range
        .reduce((toImport, range) => {
          if (range.type === 'Resource') {
            toImport.push(range)
          }

          return toImport
        }, toImport)
    }, [...this.mixinImports, this.type])

    while (toImport.length) {
      const next = toImport.splice(0, 1)[0]
      if (imported.has(next.mixinName)) continue

      imported.set(next.mixinName, next)
      getSuperClasses(this.node, types)
        .filter(sc => sc.type === 'Resource')
        .forEach(sc => toImport.push(sc))
    }

    [...imported]
      .sort(([l], [r]) => l.localeCompare(r))
      .forEach(([, mi]) => {
        if (mi.type !== 'Resource') {
          return
        }

        depsModule.addImportDeclaration({
          namedImports: [`${mi.mixinName}`],
          moduleSpecifier: `${mi.module.replace('./', '../')}.js`,
        })
        exports.push(`${mi.mixinName} as Mixin`)
      })

    depsModule.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{
        name,
        initializer: `[\n${exports.join(',\n')}]`,
      }],
    })
  }

  private addImports(mixinFile: SourceFile, context: Omit<Context, 'properties'>) {
    mixinFile.addImportDeclaration({
      namespaceImport: 'rdfine',
      moduleSpecifier: '@tpluscode/rdfine',
    })
    mixinFile.addImportDeclaration({
      namedImports: ['createFactory'],
      moduleSpecifier: '@tpluscode/rdfine/factory',
    })
    mixinFile.addImportDeclaration({
      namedImports: ['RdfineEnvironment'],
      moduleSpecifier: '@tpluscode/rdfine/environment',
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
      namedImports: [context.prefix],
      moduleSpecifier: './namespace.js',
    })
    mixinFile.addImportDeclaration({
      namedImports: ['RdfResourceCore'],
      moduleSpecifier: '@tpluscode/rdfine/RdfResource',
      isTypeOnly: true,
    })
    mixinFile.addImportDeclaration({
      namespaceImport: context.defaultExport,
      moduleSpecifier: '../index.js',
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
      .filter(imported => imported.type === 'ExternalResource' || this.superClasses.some(sc => sc.mixinName === imported.mixinName))
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

  private createMixinFunction(mixinFile: SourceFile, allGenerators: Array<GeneratedModule | ExtensionModule>, context: Omit<Context, 'properties'>) {
    const mixinFunction = mixinFile.addFunction({
      name: this.type.mixinName,
      typeParameters: [{
        name: 'Base',
        constraint: 'rdfine.Constructor',
      }],
      parameters: [{
        name: 'Resource',
        type: 'Base',
      }],
      isExported: true,
      returnType: `rdfine.Constructor<${this.type.localName} & RdfResourceCore> & Base`,
    })

    function isModuleExtending(superClass: ResourceType | ExternalResourceType) {
      return function (gen: GeneratedModule | ExtensionModule): gen is ExtensionModule {
        return 'type' in gen && gen.type.type === 'ExternalResource' && gen.type.mixinName === superClass.mixinName
      }
    }

    const baseClass = this.superClasses
      .reduce((type, superClass) => {
        const chain = `${superClass.mixinName}(${type})`

        const extendedModules = allGenerators.filter(isModuleExtending(superClass))

        return extendedModules.reduce((type, module) => {
          this.addExtensionImport(mixinFile, module)

          return `${module.type.localName}MixinEx(${type})`
        }, chain)
      }, 'Resource')

    const className = `${this.type.localName}Class`
    const mixinClass = mixinFunction.addClass({
      name: className,
      extends: baseClass,
    })

    mixinClass.addDecorator({
      name: 'rdfine.namespace',
      arguments: [context.prefix],
    })

    mixinFunction.addStatements(`return ${className} as any`)

    return mixinClass
  }

  private createInterface(mixinFile: SourceFile) {
    const superInterfaces = this.superClasses
      .map(superClass => `${superClass.qualifiedName}<D>`)

    return mixinFile.addInterface({
      name: `${this.type.localName}<D extends RDF.DatasetCore = RDF.DatasetCore>`,
      isExported: true,
      extends: [...superInterfaces, 'rdfine.RdfResource<D>'],
    })
  }

  private addExtensionImport(mixinFile: SourceFile, module: ExtensionModule) {
    mixinFile.addImportDeclaration({
      moduleSpecifier: `../extensions/${module.extended.prefix}/${module.type.localName}.js`,
    })

    mixinFile.addImportDeclaration({
      namedImports: [`${module.type.localName}MixinEx`],
      moduleSpecifier: `../extensions/${module.extended.prefix}/${module.type.localName}.js`,
    })
  }
}

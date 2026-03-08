import { Project, SourceFile } from 'ts-morph'
import { GraphPointer } from 'clownface'
import { Context, GeneratedModule } from '../index.js'
import { ExternalResourceType, ResourceType, TypeMeta, TypeMetaCollection } from '../types/index.js'

export abstract class MixinModuleBase<T extends ResourceType | ExternalResourceType> implements GeneratedModule<T> {
  type: T
  node: GraphPointer
  protected namespaceImports: Record<string, string> = {}
  protected mixinImports: Array<ResourceType | ExternalResourceType> = []

  protected constructor(clas: GraphPointer, type: T) {
    this.node = clas
    this.type = type
  }

  abstract writeModule(params: { project: Project; types: TypeMetaCollection; context: Context; indexModule: SourceFile }): void

  addMixinImport(type: ExternalResourceType | ResourceType) {
    const mixinImportExists = this.mixinImports.find(current => current.module === type.module)
    if (!mixinImportExists) {
      this.mixinImports.push(type)
    }

    this.addRdfineNamespaceImport(type)
  }

  addRdfineNamespaceImport(type: TypeMeta) {
    if (!('package' in type)) {
      return
    }
    if (this.namespaceImports[type.package]) {
      return
    }
    this.namespaceImports[type.package] = type.qualifier
  }
}

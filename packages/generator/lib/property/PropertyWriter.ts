import { ClassDeclaration, DecoratorStructure, InterfaceDeclaration, OptionalKind } from 'ts-morph'
import TermSet from '@rdfjs/term-set'
import { Context } from '../index.js'
import { TypeMeta, LiteralType, ResourceType, ExternalResourceType } from '../types/index.js'
import { MixinModuleBase } from '../MixinGenerator/MixinModuleBase.js'
import { JavascriptProperty } from './JsProperties.js'

interface PropertyWriterInit {
  interfaceDeclaration: InterfaceDeclaration
  classDeclaration: ClassDeclaration
  context: Omit<Context, 'properties'>
  module: MixinModuleBase<ResourceType | ExternalResourceType>
}

const plainNameRegex = /^[a-zA-Z]+$/

function __getJsReturnType(range: TypeMeta): string | null {
  switch (range.type) {
    case 'Constant':
      return `'${range.value}'`
    case 'Literal':
      return range.nativeName
    case 'Resource':
    case 'ExternalResource':
      return `${range.qualifiedName}<D>`
    case 'Enumeration':
      return range.qualifiedName
    case 'Term':
      return `RDF.${range.termType}`
  }

  return null
}

function rangesToPropertyTypes(result: string[], range: TypeMeta) {
  const returnType = __getJsReturnType(range)
  if (returnType && !result.includes(returnType)) {
    result.push(returnType)
  }

  return result
}

export class PropertyWriter {
  private readonly __interface: InterfaceDeclaration
  private readonly __class: ClassDeclaration
  private readonly __context: Omit<Context, 'properties'>
  private readonly __module: MixinModuleBase<ResourceType | ExternalResourceType>

  public constructor({ interfaceDeclaration, classDeclaration, context, module }: PropertyWriterInit) {
    this.__interface = interfaceDeclaration
    this.__class = classDeclaration
    this.__context = context
    this.__module = module
  }

  public addProperty(prop: JavascriptProperty) {
    let type
    const propertyTypes = prop.range
      .reduce(rangesToPropertyTypes, [])
      .sort((l, r) => l.localeCompare(r))

    for (const range of prop.range) {
      this.__module.addRdfineNamespaceImport(range)
    }

    if (propertyTypes.length === 0) {
      type = 'RDF.Term'
      this.__context.log.warn('Could not determine types for property %s', prop.term.value)
    } else {
      if (propertyTypes.includes('rdf.NamedNode')) {
        if (propertyTypes.length > 1) {
          propertyTypes.splice(propertyTypes.indexOf('rdf.NamedNode'), 1, 'RdfResource')
        }
      }

      type = propertyTypes.join(' | ')
      this.__context.log.debug('Generating Property %s => %s: %s', prop.term.value, prop.name, type)
    }

    let hasExclamationToken = false
    if (prop.values?.includes('list') || prop.values?.includes('array')) {
      if (prop.values?.includes('single')) {
        type = `${type} | Array<${type}> | undefined`
      } else {
        hasExclamationToken = true
        type = `Array<${type}>`
      }
    } else {
      type = `${type} | undefined`
    }

    const name = plainNameRegex.test(prop.name) ? prop.name : `'${prop.name}'`

    this.__interface.addProperty({
      name,
      type,
    })

    const classProp = this.__class.addProperty({
      name,
      hasExclamationToken,
      type: type.replace(/<D>/g, ''),
    })

    classProp.addDecorator(this.__createDecorator(prop, propertyTypes))
  }

  private __createDecorator(prop: JavascriptProperty, propertyTypes: string[]): OptionalKind<DecoratorStructure> {
    let name: string
    const decoratorOptions: string[] = []
    if (prop.name !== prop.termName) {
      decoratorOptions.push(`path: ${prop.prefixedTerm}`)
    }

    if (prop.values) {
      if (prop.values.length === 1) {
        decoratorOptions.push(`values: '${prop.values}'`)
      } else {
        decoratorOptions.push(`values: [${prop.values.map(v => `'${v}'`).join(', ')}]`)
      }
    }

    if (prop.semantics === 'strict' && prop.range.length === 1) {
      const resourceRange = prop.range[0]
      if (resourceRange.type === 'Resource') {
        this.__module.addMixinImport(resourceRange)

        if ('localName' in this.__module.type && this.__module.type.localName === resourceRange.localName) {
          decoratorOptions.push(`as: [${resourceRange.mixinName}]`)
        } else {
          decoratorOptions.push(`implicitTypes: [${this.__context.prefix}.${resourceRange.localName}]`)
        }
      } else if (resourceRange.type === 'ExternalResource') {
        this.__module.addMixinImport(resourceRange)
        decoratorOptions.push(`as: [${resourceRange.mixinName}]`)
      }
    }

    switch (prop.type) {
      case 'literal': {
        name = 'rdfine.property.literal'

        const uniqueTypes = [...new Set(propertyTypes)]
        const uniqueDatatypes = prop.range.reduce<TermSet>((set, range: LiteralType | Record<string, any>) => {
          if ('datatype' in range && range.datatype) {
            set.add(range.datatype)
          }
          return set
        }, new TermSet())

        if (uniqueTypes.length === 1) {
          switch (uniqueTypes.shift()) {
            case 'boolean':
              decoratorOptions.push('type: Boolean')
              break
            case 'number':
              decoratorOptions.push('type: Number')
              break
            case 'Date':
              decoratorOptions.push('type: Date')
              break
          }
        }

        if (uniqueDatatypes.size === 1) {
          const [datatype] = [...uniqueDatatypes.values()]
          decoratorOptions.push(`datatype: $rdf.namedNode('${datatype.value}')`)
        }
      }
        break
      case 'resource':
        name = 'rdfine.property.resource'
        break
      case 'term':
        name = 'rdfine.property'
        break
    }

    return {
      name,
      arguments: Object.keys(decoratorOptions).length ? [`{ ${decoratorOptions.join(', ')} }`] : [],
    }
  }
}

import type { RdfResource } from '@tpluscode/rdfine'
import type { AnyPointer } from 'clownface';
import URITemplate from 'es6-url-template'
import { IriTemplate, IriTemplateMapping } from '..//index.js'

export class TemplateExpander {
  private readonly __template: IriTemplate

  constructor(template: IriTemplate) {
    this.__template = template
  }

  public expand(baseOrFirst: undefined | string | AnyPointer | RdfResource, ...models: Array<AnyPointer | RdfResource>): string {
    if (!this.__template.template) {
      return ''
    }

    let base = ''
    let expansionModels: Array<AnyPointer | RdfResource>
    if (typeof baseOrFirst === 'string') {
      base = baseOrFirst
      expansionModels = models
    } else {
      const parent = this.findNamedParent()
      if (parent) {
        base = parent.id.value
      }
      expansionModels = baseOrFirst ? [baseOrFirst, ...models] : models
    }

    const uriTemplate = new URITemplate(this.__template.template)

    const variables = expansionModels.reduce((variables, model) => {
      return {
        ...variables,
        ...this.buildExpansionModel(this.__template.mapping, 'id' in model ? model.pointer : model),
      }
    }, {})
    const expanded = uriTemplate.expand(variables)

    if (base) {
      return new URL(expanded, base).toString()
    }

    return expanded
  }

  private findNamedParent() {
    let parent = this.__template._parent
    do {
      if (parent && !parent.isAnonymous) {
        return parent
      }

      parent = parent?._parent
    } while (parent)

    return undefined
  }

  private buildExpansionModel(mappings: IriTemplateMapping[], templateValues: AnyPointer): Record<string, string[]> {
    return mappings.reduce<Record<string, string[]>>((model, mapping) => {
      const { property, variable } = mapping

      if (!property || !variable) {
        return model
      }

      const values = templateValues.out(property.id)
        .map(({ term }) => {
          const variableRepresentation = mapping.variableRepresentation || this.__template.variableRepresentation

          return variableRepresentation?.mapValue(term) || term.value;
        })

      if (values.length === 0) {
        return model
      }

      return {
        ...model,
        [variable]: values,
      }
    }, {})
  }
}

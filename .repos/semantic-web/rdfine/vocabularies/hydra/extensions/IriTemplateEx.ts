import type { Constructor, RdfResource } from '@tpluscode/rdfine'
import { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type { AnyPointer } from 'clownface'
import type { IriTemplate } from '../index.js'
import { hydra } from '@tpluscode/rdf-ns-builders'
import { TemplateExpander } from './TemplateExpander.js'

export interface IriTemplateEx {
  expand(base?: string, ...models: Array<AnyPointer | RdfResource>): string;
  expand(...models: Array<AnyPointer | RdfResource>): string;
}

declare module '@rdfine/hydra' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface IriTemplate extends IriTemplateEx {
  }
}

export function IriTemplateExMixin<Base extends Constructor<Partial<Omit<IriTemplate, keyof IriTemplateEx>> & RdfResourceCore>>(base: Base): Constructor<RdfResourceCore & IriTemplateEx> & Base {
  class IriTemplateExClass extends base implements IriTemplateEx {
    public expand(first: undefined | string | AnyPointer | RdfResource, ...rest: Array<AnyPointer | RdfResource>): string {
      return new TemplateExpander(this as any).expand(first, ...rest)
    }
  }

  return IriTemplateExClass
}

IriTemplateExMixin.appliesTo = hydra.IriTemplate

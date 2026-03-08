import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import { ResourceMixin } from './Resource.js';

export interface HeaderSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Hydra.Resource<D>, rdfine.RdfResource<D> {
  closedSet: boolean | undefined;
  headerName: string | undefined;
  possibleValue: Array<string>;
}

export function HeaderSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HeaderSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class HeaderSpecificationClass extends ResourceMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    closedSet: boolean | undefined;
    @rdfine.property.literal()
    headerName: string | undefined;
    @rdfine.property.literal({ values: 'array' })
    possibleValue!: Array<string>;
  }
  return HeaderSpecificationClass as any
}
HeaderSpecificationMixin.appliesTo = hydra.HeaderSpecification
HeaderSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<HeaderSpecification>([ResourceMixin, HeaderSpecificationMixin], { types: [hydra.HeaderSpecification] }, env)

import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Grant<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  fundedItem: Schema.BioChemEntity<D> | Schema.CreativeWork<D> | Schema.Event<D> | Schema.MedicalEntity<D> | Schema.Organization<D> | Schema.Person<D> | Schema.Product<D> | undefined;
  funder: Schema.Organization<D> | Schema.Person<D> | undefined;
  sponsor: Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function GrantMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Grant & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GrantClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    fundedItem: Schema.BioChemEntity | Schema.CreativeWork | Schema.Event | Schema.MedicalEntity | Schema.Organization | Schema.Person | Schema.Product | undefined;
    @rdfine.property.resource()
    funder: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    sponsor: Schema.Organization | Schema.Person | undefined;
  }
  return GrantClass as any
}
GrantMixin.appliesTo = schema.Grant
GrantMixin.createFactory = (env: RdfineEnvironment) => createFactory<Grant>([IntangibleMixin, GrantMixin], { types: [schema.Grant] }, env)

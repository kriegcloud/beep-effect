import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Permit<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  issuedBy: Schema.Organization<D> | undefined;
  issuedThrough: Schema.Service<D> | undefined;
  permitAudience: Schema.Audience<D> | undefined;
  validFor: Schema.Duration<D> | undefined;
  validFrom: Date | undefined;
  validIn: Schema.AdministrativeArea<D> | undefined;
  validUntil: Date | undefined;
}

export function PermitMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Permit & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PermitClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    issuedBy: Schema.Organization | undefined;
    @rdfine.property.resource()
    issuedThrough: Schema.Service | undefined;
    @rdfine.property.resource()
    permitAudience: Schema.Audience | undefined;
    @rdfine.property.resource()
    validFor: Schema.Duration | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validFrom: Date | undefined;
    @rdfine.property.resource()
    validIn: Schema.AdministrativeArea | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    validUntil: Date | undefined;
  }
  return PermitClass as any
}
PermitMixin.appliesTo = schema.Permit
PermitMixin.createFactory = (env: RdfineEnvironment) => createFactory<Permit>([IntangibleMixin, PermitMixin], { types: [schema.Permit] }, env)

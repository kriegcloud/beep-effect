import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Relation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Thing<D>, rdfine.RdfResource<D> {
  isEvidencedBy: Rico.RecordResource<D> | undefined;
  'relation_role': Rico.Relation<D> | undefined;
  relationCertainty: RDF.Literal | undefined;
  relationConnects: Rico.Thing<D> | undefined;
  relationHasContext: Rico.Thing<D> | undefined;
  relationHasSource: Rico.Thing<D> | undefined;
  relationHasTarget: Rico.Thing<D> | undefined;
  relationSource: RDF.Literal | undefined;
  relationState: RDF.Literal | undefined;
}

export function RelationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Relation & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RelationClass extends ThingMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.RecordResource] })
    isEvidencedBy: Rico.RecordResource | undefined;
    @rdfine.property.resource({ as: [RelationMixin] })
    'relation_role': Rico.Relation | undefined;
    @rdfine.property()
    relationCertainty: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    relationConnects: Rico.Thing | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    relationHasContext: Rico.Thing | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    relationHasSource: Rico.Thing | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    relationHasTarget: Rico.Thing | undefined;
    @rdfine.property()
    relationSource: RDF.Literal | undefined;
    @rdfine.property()
    relationState: RDF.Literal | undefined;
  }
  return RelationClass as any
}
RelationMixin.appliesTo = rico.Relation
RelationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Relation>([ThingMixin, RelationMixin], { types: [rico.Relation] }, env)

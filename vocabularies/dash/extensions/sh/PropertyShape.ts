import * as rdfine from '@tpluscode/rdfine';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from '@tpluscode/rdf-ns-builders';
import { dash } from '../../lib/namespace.js';
import type * as Dash from '../../index.js';
import type * as Shacl from '@rdfine/shacl';
import { NodeShapeMixin as ShaclNodeShapeMixin } from '@rdfine/shacl/lib/NodeShape';

interface PropertyShapeEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  composite: boolean | undefined;
  editor: Dash.Editor<D> | undefined;
  hidden: boolean | undefined;
  indexed: boolean | undefined;
  mimeTypes: string | undefined;
  neverMaterialize: boolean | undefined;
  readOnly: boolean | undefined;
  reifiableBy: Array<Shacl.NodeShape<D>>;
  viewer: Dash.Viewer<D> | undefined;
}

declare module '@rdfine/shacl/lib/PropertyShape' {
  interface PropertyShape<D extends RDF.DatasetCore> extends PropertyShapeEx<D> {
  }
}

export function PropertyShapeMixinEx<Base extends rdfine.ExtendingConstructor<Shacl.PropertyShape, PropertyShapeEx>>(Resource: Base): rdfine.Constructor<PropertyShapeEx & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class Impl extends Resource implements PropertyShapeEx {
    @rdfine.property.literal({ type: Boolean })
    composite: boolean | undefined;
    @rdfine.property.resource({ implicitTypes: [dash.Editor] })
    editor: Dash.Editor | undefined;
    @rdfine.property.literal({ type: Boolean })
    hidden: boolean | undefined;
    @rdfine.property.literal({ type: Boolean })
    indexed: boolean | undefined;
    @rdfine.property.literal()
    mimeTypes: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    neverMaterialize: boolean | undefined;
    @rdfine.property.literal({ type: Boolean })
    readOnly: boolean | undefined;
    @rdfine.property.resource({ values: 'array', as: [ShaclNodeShapeMixin] })
    reifiableBy!: Array<Shacl.NodeShape>;
    @rdfine.property.resource({ implicitTypes: [dash.Viewer] })
    viewer: Dash.Viewer | undefined;
  }
  return Impl
}
PropertyShapeMixinEx.appliesTo = sh.PropertyShape

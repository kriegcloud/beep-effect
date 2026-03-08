import type * as RDF from '@rdfjs/types';
import { resolve } from 'relative-to-absolute-iri';
import type { IItemScope } from '../IItemScope';
import type { Util } from '../Util';
import type { IItemPropertyHandler } from './IItemPropertyHandler';

/**
 * Handler for an item property with a URL attribute.
 */
export class ItemPropertyHandlerUrl implements IItemPropertyHandler {
  private readonly tagName: string;
  private readonly attributeName: string;

  public constructor(tagName: string, attributeName: string) {
    this.tagName = tagName;
    this.attributeName = attributeName;
  }

  public canHandle(tagName: string, attributes: Record<string, string>): boolean {
    return this.tagName === tagName && this.attributeName in attributes;
  }

  public getObject(attributes: Record<string, string>, util: Util, itemScope: IItemScope): RDF.Quad_Object {
    return util.dataFactory.namedNode(resolve(attributes[this.attributeName], util.baseIRI));
  }
}

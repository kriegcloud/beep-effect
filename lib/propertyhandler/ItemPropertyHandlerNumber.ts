import type * as RDF from '@rdfjs/types';
import type { IItemScope } from '../IItemScope';
import { Util } from '../Util';
import type { IItemPropertyHandler } from './IItemPropertyHandler';

/**
 * Handler for an item property with a number attribute.
 */
export class ItemPropertyHandlerNumber implements IItemPropertyHandler {
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
    const value = attributes[this.attributeName];
    let datatype: string | undefined;
    if (!Number.isNaN(Number.parseInt(value, 10)) && !value.includes('.')) {
      datatype = `${Util.XSD}integer`;
    } else if (!Number.isNaN(Number.parseFloat(value))) {
      datatype = `${Util.XSD}double`;
    }
    return util.dataFactory.literal(value, datatype && util.dataFactory.namedNode(datatype));
  }
}

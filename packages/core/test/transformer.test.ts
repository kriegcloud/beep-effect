import { describe, it } from 'vitest';
import { TransformerTyped } from '../lib/index.js';

interface Fruit {
  type: 'fruit';
  [key: string]: any;
}

interface Vegetable {
  type: 'vegetable';
  [key: string]: any;
}

describe('transformer', () => {
  const transformer = new TransformerTyped<Fruit | Vegetable>();
  it('makes copies when needed', ({ expect }) => {
    const fruit: Fruit = {
      type: 'fruit',
      clone1: { type: 'vegetable', random: { type: 'fruit', val: 'blep' }},
    };
    const fullCopy = <any> transformer.transformNode(fruit, {});
    expect(fullCopy).not.toBe(fruit);
    expect(fullCopy.clone1).not.toBe(fruit.clone1);
    expect(fullCopy.clone1.random).not.toBe(fruit.clone1.random);

    const sameVegetable = <any> transformer.transformNode(fruit, {
      vegetable: { preVisitor: () => ({ copy: false }) },
      fruit: { transform: (fruit: any) => {
        fruit.test = 'yes';
        return fruit;
      } },
    });
    expect(sameVegetable).not.toBe(fruit);
    expect(sameVegetable.clone1).toBe(fruit.clone1);
    expect(sameVegetable.clone1.random).toMatchObject({ test: 'yes' });
  });

  it('knows shortcut and continue', ({ expect }) => {
    const in2 = { type: 'fruit', val: 'depth3' };
    const in1 = { type: 'vegetable', in: in2, val: 'depth2' };
    const side1 = { type: 'fruit', val: 'side1' };
    const side2 = { type: 'vegetable' };
    const fruit: Fruit = { type: 'fruit', in: in1, val: 'depth1', side: side1, side2 };

    const onlyCopyDepth1 = <any> transformer.transformNode(fruit, {
      fruit: { preVisitor: () => ({ continue: false }) },
    });
    expect(onlyCopyDepth1).not.toBe(fruit);
    expect(onlyCopyDepth1.in).toBe(in1);
    expect(onlyCopyDepth1.in.in).toBe(in2);
    expect(onlyCopyDepth1.side).toBe(side1);

    const doNotCopy = <any> transformer.transformNode(fruit, {
      fruit: { preVisitor: () => ({ continue: false, copy: false }) },
    });
    expect(doNotCopy).toBe(fruit);
    expect(doNotCopy.in).toBe(in1);
    expect(doNotCopy.in.in).toBe(in2);
    expect(doNotCopy.side).toBe(side1);

    const doNotCopyByShortcut = <any> transformer.transformNode(fruit, {
      fruit: { preVisitor: () => ({ shortcut: true }) },
    });
    expect(doNotCopyByShortcut).not.toBe(fruit);
    expect(doNotCopyByShortcut.in).toBe(in1);
    expect(doNotCopyByShortcut.in.in).toBe(in2);
    expect(doNotCopyByShortcut.side).toBe(side1);

    const doNotCopySideWhenShortcut = <any> transformer.transformNode(fruit, {
      vegetable: { preVisitor: () => ({ shortcut: true }) },
    });
    expect(doNotCopySideWhenShortcut).not.toBe(fruit);
    expect(doNotCopySideWhenShortcut.in).toBe(in1);
    expect(doNotCopySideWhenShortcut.in.in).toBe(in2);
    expect(doNotCopySideWhenShortcut.side).toBe(side1);
    expect(doNotCopySideWhenShortcut.side2).not.toBe(side2);
  });

  it('knows shallowKeys and ignoreKeys', ({ expect }) => {
    const in2 = { type: 'fruit', val: 'depth3' };
    const in1 = { type: 'vegetable', in: in2, val: 'depth2' };
    const side1 = { type: 'fruit', val: 'side1' };
    const fruit: Fruit = { type: 'fruit', in: in1, val: 'depth1', side: side1 };

    const noDeepOnShallowKeys = <any> transformer.transformNode(fruit, {
      fruit: { preVisitor: () => ({ shallowKeys: new Set([ 'in' ]) }) },
    });
    expect(noDeepOnShallowKeys).not.toBe(fruit);
    expect(noDeepOnShallowKeys.in).not.toBe(in1);
    expect(noDeepOnShallowKeys.in.in).toBe(in2);
    expect(noDeepOnShallowKeys.side).not.toBe(side1);

    const ignoreKeysAreIgnored = <any> transformer.transformNode(fruit, {
      fruit: { preVisitor: () => ({ ignoreKeys: new Set([ 'in' ]) }) },
    });
    expect(ignoreKeysAreIgnored).not.toBe(fruit);
    expect(ignoreKeysAreIgnored.in).toBe(in1);
    expect(ignoreKeysAreIgnored.in.in).toBe(in2);
    expect(ignoreKeysAreIgnored.side).not.toBe(side1);
  });
});

import type { IconifyJSON } from "@iconify/react";
import { addCollection } from "@iconify/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import allIcons from "./icon-sets";

export const iconSets = F.pipe(
  A.reduce(Struct.entries(allIcons), [] as IconifyJSON[], (acc, [k, v]) => {
    const parts = Str.split(":")(k);
    const prefixOption = O.fromNullable(parts[0]);
    const iconNameOption = O.fromNullable(parts[1]);
    const existingPrefixOption = A.findFirst(
      acc,
      (item) => O.isSome(prefixOption) && item.prefix === prefixOption.value
    );

    if (O.isSome(iconNameOption) && O.isSome(prefixOption)) {
      const iconName = iconNameOption.value;
      const prefix = prefixOption.value;
      if (O.isSome(existingPrefixOption)) {
        const existingPrefix = existingPrefixOption.value;
        existingPrefix.icons[iconName] = v;
      } else {
        acc.push({
          prefix: prefix as IconifyJSON["prefix"],
          icons: {
            [iconName]: v,
          },
        });
      }
    }

    return acc;
  })
);

export const allIconNames = Object.keys(allIcons) as IconifyName[];

export type IconifyName = keyof typeof allIcons;

let areIconsRegistered = false;

export function registerIcons() {
  if (areIconsRegistered) {
    return;
  }

  iconSets.forEach((iconSet) => {
    const iconSetConfig = {
      ...iconSet,
      ...Match.value(iconSet.prefix).pipe(
        Match.when("carbon", () => ({
          width: 32,
          height: 32,
        })),
        Match.when("twemoji", () => ({
          width: 36,
          height: 36,
        })),
        Match.orElse(() => ({
          width: 24,
          height: 24,
        }))
      ),
    };

    addCollection(iconSetConfig);
  });

  areIconsRegistered = true;
}

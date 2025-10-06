import type { IconifyJSON } from "@iconify/react";

import { addCollection } from "@iconify/react";

import * as A from "effect/Array";
import * as R from "effect/Record";
import allIcons from "./icon-sets";

export const iconSets = A.reduce(R.toEntries(allIcons), [] as IconifyJSON[], (acc, [key, value]) => {
  const [prefix, iconName] = key.split(":");
  const existingPrefix = acc.find((item) => item.prefix === prefix);

  if (existingPrefix) {
    existingPrefix.icons[iconName as keyof typeof existingPrefix] = value;
  } else {
    acc.push({
      prefix: prefix as IconifyJSON["prefix"],
      icons: {
        [iconName as keyof typeof existingPrefix]: value,
      },
    });
  }

  return acc;
});

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
      width: (iconSet.prefix === "carbon" && 32) || 24,
      height: (iconSet.prefix === "carbon" && 32) || 24,
    };

    addCollection(iconSetConfig);
  });

  areIconsRegistered = true;
}

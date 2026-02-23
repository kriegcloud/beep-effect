import type { NavSectionProps } from "@beep/ui/routing";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

export type NavItem = {
  readonly title: string;
  readonly path: string;
  readonly children?: NavItem[] | undefined;
};

export type OutputItem = {
  readonly title: string;
  readonly path: string;
  readonly group: string;
};

const flattenNavItems = (navItems: NavItem[], parentGroup?: string): OutputItem[] => {
  let flattenedItems: OutputItem[] = [];

  A.forEach(navItems, (navItem) => {
    const currentGroup = parentGroup ? `${parentGroup}-${navItem.title}` : navItem.title;
    const groupArray = F.pipe(currentGroup, Str.split("-"));

    flattenedItems.push({
      title: navItem.title,
      path: navItem.path,
      group: groupArray.length > 2 ? `${groupArray[0]}.${groupArray[1]}` : groupArray[0]!,
    });

    if (navItem.children) {
      flattenedItems = flattenedItems.concat(flattenNavItems(navItem.children, currentGroup));
    }
  });
  return flattenedItems;
};

export function flattenNavSections(navSections: NavSectionProps["data"]): OutputItem[] {
  return F.pipe(
    navSections,
    A.flatMap((navSection) => flattenNavItems(navSection.items, navSection.subheader))
  );
}

type ApplyFilterProps = {
  query: string;
  inputData: OutputItem[];
};

export function applyFilter({ inputData, query }: ApplyFilterProps): OutputItem[] {
  if (!query) return inputData;

  const lowerQuery = F.pipe(query, Str.toLowerCase);

  return F.pipe(
    inputData,
    A.filter(({ title, path, group }) =>
      F.pipe(
        [title, path, group],
        A.some((field) => field != null && F.pipe(field, Str.toLowerCase, Str.includes(lowerQuery)))
      )
    )
  );
}

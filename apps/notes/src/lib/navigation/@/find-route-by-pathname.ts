import type { routes } from "@beep/notes/lib/navigation/routes";
import type React from "react";

export type RouteMap = Partial<Record<keyof typeof routes, RouteMapItem>>;

export type RouteMapItem = {
  readonly component: React.FC | string;
  readonly path: string;
};

const matchDynamicRoute = (routePattern: string, currentPath: string) => {
  const routeSegments = routePattern.split("/").filter(Boolean); // Remove empty segments
  const pathSegments = currentPath.split("/").filter(Boolean); // Remove empty segments

  if (routeSegments.length !== pathSegments.length) {
    return false;
  }

  return routeSegments.every((segment, index) => {
    return segment.includes(":") || segment === pathSegments[index];
  });
};

export const findRouteByPathname = (routeMap: RouteMap, pathname: string) => {
  for (const [key, value] of Object.entries(routeMap)) {
    if (value && matchDynamicRoute(value.path, pathname)) {
      return routeMap[key as keyof typeof routes];
    }
  }

  return routeMap.home; // Fallback to home if no route matches
};

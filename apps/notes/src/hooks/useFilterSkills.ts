import { useCallback, useState } from "react";

export type FilterTypes = "liked" | "newest" | "oldest";

const filters: FilterTypes[] = ["newest", "oldest", "liked"];
const filterLabels: Record<FilterTypes, string> = {
  liked: "Most interactions",
  newest: "Most recent",
  oldest: "Oldest",
};

export const useFilterSkills = () => {
  const [currentFilter, setCurrentFilter] = useState<FilterTypes>("newest");

  const toggleFilter = useCallback((value: FilterTypes) => () => setCurrentFilter(value), []);

  return { currentFilter, filterLabels, filters, toggleFilter };
};

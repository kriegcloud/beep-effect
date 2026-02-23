import { createStore } from "zustand-x";

export const SearchStore = createStore(
  {
    isOpen: false,
    search: "",
  },
  { mutative: true, name: "search" }
).extendActions(({ get, set }) => ({
  setSearch: (search: string) => set("search", search),
  toggle: () => set("isOpen", !get("isOpen")),
  onClose: () => set("isOpen", false),
  onOpen: () => set("isOpen", true),
}));

export const { useValue: useSearchValue } = SearchStore;

export const searchActions = SearchStore.set;

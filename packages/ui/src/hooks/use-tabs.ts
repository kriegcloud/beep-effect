"use client";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { useCallback, useState } from "react";

/**
 * Custom hook to manage the state of tabs.
 *
 * @param {string} defaultValue - The initial value of the tab.
 *
 * @returns {UseTabsReturn} - An object containing:
 * - `value`: The current value of the tab.
 * - `setValue`: A function to manually set the value of the tab.
 * - `onChange`: A function to handle the change event when a new tab is selected.
 *
 * @example
 * const { value, onChange } = useTabs('tab1');
 *
 * return (
 *   <Tabs value={value} onChange={onChange}>
 *     <Tab label="Tab 1" value="tab1" />
 *     <Tab label="Tab 2" value="tab2" />
 *   </Tabs>
 * );
 */

export type UseTabsReturn = {
  readonly value: string;
  readonly setValue: Dispatch<SetStateAction<string>>;
  readonly onChange: (event: SyntheticEvent, newValue: string) => void;
};

export function useTabs(defaultValue: string): UseTabsReturn {
  const [value, setValue] = useState(defaultValue);

  const onChange = useCallback((_event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  }, []);

  return {
    value,
    setValue,
    onChange,
  };
}

/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useMemo } from "react";

import { api } from "../react";

export const useQueryUtils =
  <
    T extends {
      cancel: (...args: any) => any;
      getData: (...args: any) => any;
      invalidate: (...args: any) => any;
      setData: (...args: any) => any;
    },
  >(
    useUtils: (utils: ReturnType<typeof api.useUtils>) => T
  ) =>
  (input?: Parameters<T["getData"]>[0]) => {
    const utils = useUtils(api.useUtils());

    const methods = useMemo(
      () => ({
        cancel: async () => {
          await utils.cancel(input);
        },
        getData: () => {
          return utils.getData(input) as NonNullable<ReturnType<T["getData"]>>;
        },
        invalidate: () => {
          void utils.invalidate(input);
        },
        setData: (updater: Parameters<T["setData"]>[1]) => {
          utils.setData(input, updater);
        },
      }),
      [input, utils]
    );

    return {
      ...methods,
      rollback: useCallback(
        // (context?: { prevData: NonNullable<ReturnType<T['getData']>> }) => {
        (context?: any) => {
          methods.setData(context?.prevData);
        },
        [methods]
      ),
      update: useCallback(
        async (
          updater: (prevData: NonNullable<ReturnType<T["getData"]>>) => NonNullable<ReturnType<T["getData"]>>,
          { cancel = true }: { cancel?: boolean } = {}
        ) => {
          if (cancel) {
            await methods.cancel();
          }

          const prevData = methods.getData();

          // Can happen when never queried before
          if (!prevData) return;

          methods.setData(updater(prevData));

          return { prevData };
        },
        [methods]
      ),
      utils,
    };
  };

export const useInfiniteQueryUtils =
  <
    T extends {
      cancel: (...args: any) => any;
      getInfiniteData: (...args: any) => any;
      invalidate: (...args: any) => any;
      setInfiniteData: (...args: any) => any;
    },
  >(
    useUtils: (utils: ReturnType<typeof api.useUtils>) => T
  ) =>
  (input?: Parameters<T["getInfiniteData"]>[0]) => {
    const utils = useUtils(api.useUtils());

    const methods = useMemo(
      () => ({
        cancel: async () => {
          await utils.cancel(input);
        },
        getInfiniteData: () => {
          return utils.getInfiniteData(input) as NonNullable<ReturnType<T["getInfiniteData"]>>;
        },
        invalidate: () => {
          void utils.invalidate(input);
        },
        setInfiniteData: (updater: Parameters<T["setInfiniteData"]>[1]) => {
          utils.setInfiniteData(input, updater);
        },
      }),
      [input, utils]
    );

    return {
      ...methods,
      rollback: useCallback(
        (context?: { prevData: NonNullable<ReturnType<T["getInfiniteData"]>> }) => {
          methods.setInfiniteData(context?.prevData);
        },
        [methods]
      ),
      update: useCallback(
        async (
          updater: (
            prevData: NonNullable<ReturnType<T["getInfiniteData"]>>
          ) => NonNullable<ReturnType<T["getInfiniteData"]>>,
          { cancel = true }: { cancel?: boolean } = {}
        ) => {
          if (cancel) {
            await methods.cancel();
          }

          const prevData = methods.getInfiniteData();

          if (!prevData) return;

          methods.setInfiniteData(updater(prevData));

          return { prevData };
        },
        [methods]
      ),
      utils,
    };
  };

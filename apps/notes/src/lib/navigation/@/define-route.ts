export const defineRoute = <Schema extends { params?: {}; search?: {} }>(path: string) => {
  type Params = Schema["params"] extends Record<string, any> ? Required<Schema["params"]> : {};
  type Search =
    Schema["search"] extends Record<string, any>
      ? { search: Required<Schema["search"]> }
      : { search?: Schema["search"] };

  return (paramsSearch?: Params & Search) => {
    const { search, ...params } = paramsSearch ?? {};
    let result = path;

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        result = result.replace(`[${key}]`, value as any);
      }
    }
    if (search) {
      const searchParams = new URLSearchParams(search as any).toString();
      result += `?${searchParams}`;
    }

    return result;
  };
};

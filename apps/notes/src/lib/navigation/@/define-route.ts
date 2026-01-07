export const defineRoute = <Schema extends { params?: undefined | {}; search?: undefined | {} }>(path: string) => {
  // biome-ignore lint/suspicious/noExplicitAny: Type-level Record requires any for generic params
  type Params = Schema["params"] extends Record<string, any> ? Required<Schema["params"]> : {};
  type Search =
    // biome-ignore lint/suspicious/noExplicitAny: Type-level Record requires any for generic params
    Schema["search"] extends Record<string, any>
      ? { search: Required<Schema["search"]> }
      : { search?: undefined | Schema["search"] };

  return (paramsSearch?: undefined | (Params & Search)) => {
    const { search, ...params } = paramsSearch ?? {};
    let result = path;

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        // biome-ignore lint/suspicious/noExplicitAny: Route param value can be any serializable type
        result = result.replace(`[${key}]`, value as any);
      }
    }
    if (search) {
      // biome-ignore lint/suspicious/noExplicitAny: URLSearchParams accepts Record with any values
      const searchParams = new URLSearchParams(search as any).toString();
      result += `?${searchParams}`;
    }

    return result;
  };
};

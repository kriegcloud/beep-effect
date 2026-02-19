export type ErrorProps = {
  readonly error: { readonly digest?: undefined | string } & Error;
  readonly reset: () => void;
};

export interface LayoutProps {
  readonly children: React.ReactNode;
}

export interface PageProps<Params = any, SearchParams = any> {
  readonly params: Promise<Params>;
  readonly searchParams: Promise<SearchParams>;
}

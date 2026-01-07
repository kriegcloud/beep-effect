export type ErrorProps = {
  readonly error: { readonly digest?: undefined | string } & Error;
  readonly reset: () => void;
};

export interface LayoutProps {
  readonly children: React.ReactNode;
}

// biome-ignore lint/suspicious/noExplicitAny: Next.js PageProps generic defaults require any
export interface PageProps<Params = any, SearchParams = any> {
  readonly params: Promise<Params>;
  readonly searchParams: Promise<SearchParams>;
}

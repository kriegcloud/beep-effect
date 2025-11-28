export type ErrorProps = {
  error: { digest?: string } & Error;
  reset: () => void;
};

export interface LayoutProps {
  children: React.ReactNode;
}

export interface PageProps<Params = any, SearchParams = any> {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

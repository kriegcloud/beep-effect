import { AuthSplitLayout } from "@beep/ui/layouts/auth-split";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}

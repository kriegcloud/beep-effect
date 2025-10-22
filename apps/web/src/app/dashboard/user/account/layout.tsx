import { AccountLayout } from "@/features/account/account-layout";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <AccountLayout> {children}</AccountLayout>;
}

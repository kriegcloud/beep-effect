export type Profile = {
  readonly id?: string | number | undefined;
  readonly email?: string | null | undefined;
  readonly name?: string | null | undefined;
  readonly displayUsername?: string | null | undefined;
  readonly username?: string | null | undefined;
  readonly displayName?: string | null | undefined;
  readonly firstName?: string | null | undefined;
  readonly fullName?: string | null | undefined;
  readonly isAnonymous?: boolean | null | undefined;
  readonly emailVerified?: boolean | null | undefined;
  readonly image?: string | null | undefined;
  readonly avatar?: string | null | undefined;
  readonly avatarUrl?: string | null | undefined;
};

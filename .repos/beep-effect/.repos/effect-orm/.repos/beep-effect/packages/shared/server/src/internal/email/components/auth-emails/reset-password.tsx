import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface BetterAuthResetPasswordEmailProps {
  readonly username?: string | undefined;
  readonly resetLink?: string | undefined;
}

export const ResetPasswordEmail = ({ username, resetLink }: BetterAuthResetPasswordEmailProps) => {
  const previewText = `Reset your Better Auth password`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
              Reset your <strong>Better Auth</strong> password
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">Hello {username},</Text>
            <Text className="text-[14px] text-black leading-[24px]">
              We received a request to reset your password for your Better Auth account. If you didn't make this
              request, you can safely ignore this email.
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={resetLink}
              >
                Reset Password
              </Button>
            </Section>
            <Text className="text-[14px] text-black leading-[24px]">
              Or copy and paste this URL into your browser:{" "}
              <Link href={resetLink} className="text-blue-600 no-underline">
                {resetLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactResetPasswordEmail(props: BetterAuthResetPasswordEmailProps) {
  return <ResetPasswordEmail {...props} />;
}

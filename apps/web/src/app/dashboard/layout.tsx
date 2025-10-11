"use client";
import { assetPaths } from "@beep/constants";
import { iam } from "@beep/iam-sdk";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { DashboardLayout } from "@beep/ui/layouts";
import { fSub } from "@beep/ui/utils";
import { faker } from "@faker-js/faker";
import * as Effect from "effect/Effect";
import type React from "react";
import { AuthGuard } from "@/providers/AuthGuard";

const _id = [
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b6`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b7`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b8`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b9`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7ba`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bb`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bc`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bd`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7be`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bf`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bg`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bh`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bi`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bj`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bk`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bl`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bm`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bn`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bo`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bp`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bq`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7br`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bs`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bt`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bu`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bv`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bw`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bx`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7by`,
  `e99f09a7-dd88-49d5-b1c8-1daf80c2d7bz`,
] as const;
const _fullAddress = [
  `19034 Verna Unions Apt. 164 - Honolulu, RI / 87535`,
  `1147 Rohan Drive Suite 819 - Burlington, VT / 82021`,
  `18605 Thompson Circle Apt. 086 - Idaho Falls, WV / 50337`,
  `110 Lamar Station Apt. 730 - Hagerstown, OK / 49808`,
  `36901 Elmer Spurs Apt. 762 - Miramar, DE / 92836`,
  `2089 Runolfsson Harbors Suite 886 - Chapel Hill, TX / 32827`,
  `279 Karolann Ports Apt. 774 - Prescott Valley, WV / 53905`,
  `96607 Claire Square Suite 591 - St. Louis Park, HI / 40802`,
  `9388 Auer Station Suite 573 - Honolulu, AK / 98024`,
  `47665 Adaline Squares Suite 510 - Blacksburg, NE / 53515`,
  `989 Vernice Flats Apt. 183 - Billings, NV / 04147`,
  `91020 Wehner Locks Apt. 673 - Albany, WY / 68763`,
  `585 Candelario Pass Suite 090 - Columbus, LA / 25376`,
  `80988 Renner Crest Apt. 000 - Fargo, VA / 24266`,
  `28307 Shayne Pike Suite 523 - North Las Vegas, AZ / 28550`,
  `205 Farrell Highway Suite 333 - Rock Hill, OK / 63421`,
  `253 Kara Motorway Suite 821 - Manchester, SD / 09331`,
  `13663 Kiara Oval Suite 606 - Missoula, AR / 44478`,
  `8110 Claire Port Apt. 703 - Anchorage, TN / 01753`,
  `4642 Demetris Lane Suite 407 - Edmond, AZ / 60888`,
  `74794 Asha Flat Suite 890 - Lancaster, OR / 13466`,
  `8135 Keeling Pines Apt. 326 - Alexandria, MA / 89442`,
  `441 Gibson Shores Suite 247 - Pasco, NM / 60678`,
  `4373 Emelia Valley Suite 596 - Columbia, NM / 42586`,
];
const _roles = [
  `CEO`,
  `CTO`,
  `Project Coordinator`,
  `Team Leader`,
  `Software Developer`,
  `Marketing Strategist`,
  `Data Analyst`,
  `Product Owner`,
  `Graphic Designer`,
  `Operations Manager`,
  `Customer Support Specialist`,
  `Sales Manager`,
  `HR Recruiter`,
  `Business Consultant`,
  `Financial Planner`,
  `Network Engineer`,
  `Content Creator`,
  `Quality Assurance Tester`,
  `Public Relations Officer`,
  `IT Administrator`,
  `Compliance Officer`,
  `Event Planner`,
  `Legal Counsel`,
  `Training Coordinator`,
];
const _emails = [
  `nannie.abernathy70@yahoo.com`,
  `ashlynn.ohara62@gmail.com`,
  `milo.farrell@hotmail.com`,
  `violet.ratke86@yahoo.com`,
  `letha.lubowitz24@yahoo.com`,
  `aditya.greenfelder31@gmail.com`,
  `lenna.bergnaum27@hotmail.com`,
  `luella.ryan33@gmail.com`,
  `joana.simonis84@gmail.com`,
  `marjolaine.white94@gmail.com`,
  `vergie.block82@hotmail.com`,
  `vito.hudson@hotmail.com`,
  `tyrel.greenholt@gmail.com`,
  `dwight.block85@yahoo.com`,
  `mireya13@hotmail.com`,
  `dasia.jenkins@hotmail.com`,
  `benny89@yahoo.com`,
  `dawn.goyette@gmail.com`,
  `zella.hickle4@yahoo.com`,
  `avery43@hotmail.com`,
  `olen.legros@gmail.com`,
  `jimmie.gerhold73@hotmail.com`,
  `genevieve.powlowski@hotmail.com`,
  `louie.kuphal39@gmail.com`,
];
const _fullNames = [
  `Jayvion Simon`,
  `Lucian Obrien`,
  `Deja Brady`,
  `Harrison Stein`,
  `Reece Chung`,
  `Lainey Davidson`,
  `Cristopher Cardenas`,
  `Melanie Noble`,
  `Chase Day`,
  `Shawn Manning`,
  `Soren Durham`,
  `Cortez Herring`,
  `Brycen Jimenez`,
  `Giana Brandt`,
  `Aspen Schmitt`,
  `Colten Aguilar`,
  `Angelique Morse`,
  `Selina Boyer`,
  `Lawson Bass`,
  `Ariana Lang`,
  `Amiah Pruitt`,
  `Harold Mcgrath`,
  `Esperanza Mcintyre`,
  `Mireya Conner`,
];
const _phoneNumbers = [
  "+1 202-555-0143",
  "+1 416-555-0198",
  "+44 20 7946 0958",
  "+61 2 9876 5432",
  "+91 22 1234 5678",
  "+49 30 123456",
  "+33 1 23456789",
  "+81 3 1234 5678",
  "+86 10 1234 5678",
  "+55 11 2345-6789",
  "+27 11 123 4567",
  "+7 495 123-4567",
  "+52 55 1234 5678",
  "+39 06 123 4567",
  "+34 91 123 4567",
  "+31 20 123 4567",
  "+46 8 123 456",
  "+41 22 123 45 67",
  "+82 2 123 4567",
  "+54 11 1234-5678",
  "+64 9 123 4567",
  "+65 1234 5678",
  "+60 3-1234 5678",
  "+66 2 123 4567",
  "+62 21 123 4567",
  "+63 2 123 4567",
  "+90 212 123 45 67",
  "+966 11 123 4567",
  "+971 2 123 4567",
  "+20 2 12345678",
  "+234 1 123 4567",
  "+254 20 123 4567",
  "+972 3-123-4567",
  "+30 21 1234 5678",
  "+353 1 123 4567",
  "+351 21 123 4567",
  "+47 21 23 45 67",
  "+45 32 12 34 56",
  "+358 9 123 4567",
  "+48 22 123 45 67",
];
const _images = [
  assetPaths.assets.images.mock.avatar.avatar1,
  assetPaths.assets.images.mock.avatar.avatar2,
  assetPaths.assets.images.mock.avatar.avatar3,
  assetPaths.assets.images.mock.avatar.avatar4,
];

const _contacts = Array.from({ length: 20 }, (_, index) => {
  const status = (index % 2 && "online") || (index % 3 && "offline") || (index % 4 && "always") || "busy";

  return {
    id: _id[index]!,
    status,
    role: _roles[index]!,
    email: _emails[index]!,
    name: _fullNames[index]!,
    phoneNumber: _phoneNumbers[index]!,
    lastActivity: fSub({ days: index, hours: index }),
    avatarUrl: faker.helpers.arrayElement(_images),
    address: _fullAddress[index]!,
  };
});
const _workspaces = [
  {
    id: "team-1",
    name: "Team 1",
    plan: "Free",
    logo: assetPaths.assets.icons.workspaces.logo1,
  },
  {
    id: "team-2",
    name: "Team 2",
    plan: "Pro",
    logo: assetPaths.assets.icons.workspaces.logo2,
  },
  {
    id: "team-3",
    name: "Team 3",
    plan: "Pro",
    logo: assetPaths.assets.icons.workspaces.logo3,
  },
];
const _notifications = Array.from({ length: 9 }, (_, index) => ({
  id: _id[index]!,
  avatarUrl: faker.helpers.arrayElement(_images),
  type: ["friend", "project", "file", "tags", "payment", "order", "delivery", "chat", "mail"][index]!,
  category: [
    "Communication",
    "Project UI",
    "File manager",
    "File manager",
    "File manager",
    "Order",
    "Order",
    "Communication",
    "Communication",
  ][index]!,
  isUnread: faker.datatype.boolean(),
  createdAt: fSub({ days: index, hours: index }),
  title:
    (index === 0 && `<p><strong>Deja Brady</strong> sent you a friend request</p>`) ||
    (index === 1 &&
      `<p><strong>Jayvon Hull</strong> mentioned you in <strong><a href='#'>Minimal UI</a></strong></p>`) ||
    (index === 2 &&
      `<p><strong>Lainey Davidson</strong> added file to <strong><a href='#'>File manager</a></strong></p>`) ||
    (index === 3 &&
      `<p><strong>Angelique Morse</strong> added new tags to <strong><a href='#'>File manager<a/></strong></p>`) ||
    (index === 4 && `<p><strong>Giana Brandt</strong> request a payment of <strong>$200</strong></p>`) ||
    (index === 5 && `<p>Your order is placed waiting for shipping</p>`) ||
    (index === 6 && `<p>Delivery processing your order is being shipped</p>`) ||
    (index === 7 && `<p>You have new message 5 unread messages</p>`) ||
    (index === 8 && `<p>You have new mail`) ||
    "",
}));
const TEMP_MOCKED_DATA = {
  userOrgs: [
    {
      id: 1,
      name: "beep 1",
      logo: assetPaths.assets.images.mock.avatar.avatar1,
    },
    {
      id: 2,
      name: "beep 2",
      logo: assetPaths.assets.images.mock.avatar.avatar1,
    },
  ],
  userAccounts: [
    { id: 1, name: "account 1" },
    { id: 2, name: "account 2" },
  ],
  notifications: _notifications,
  workspaces: _workspaces,
  contacts: _contacts,
};

type Props = {
  children: React.ReactNode;
};
// mock switchAccount with Promise timeout
const switchAccount = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const switchOrg = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export default function Layout({ children }: Props) {
  const router = useRouter();
  const runtime = useRuntime();
  const runSignOut = makeRunClientPromise(runtime, "iam.signOut");
  const runSwitchAccount = makeRunClientPromise(runtime, "iam.account.switchAccount");
  const runSwitchOrg = makeRunClientPromise(runtime, "iam.organization.switchOrg");

  return (
    <AuthGuard
      switchAccount={() => runSwitchAccount(Effect.tryPromise(switchAccount))}
      switchOrganization={() => runSwitchOrg(Effect.tryPromise(switchOrg))}
      signOut={() =>
        runSignOut(
          iam.signOut({
            onSuccess: () => {
              router.refresh();
              void router.push(paths.auth.signIn);
            },
          })
        )
      }
      userOrgs={TEMP_MOCKED_DATA.userOrgs}
      userAccounts={TEMP_MOCKED_DATA.userAccounts}
      notifications={TEMP_MOCKED_DATA.notifications}
      workspaces={TEMP_MOCKED_DATA.workspaces}
      contacts={TEMP_MOCKED_DATA.contacts}
    >
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}

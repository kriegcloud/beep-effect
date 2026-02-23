export interface Plan {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly highlight?: undefined | boolean;
  readonly type?: undefined | "monthly" | "yearly";
  readonly currency?: undefined | string;
  readonly monthlyPrice: string;
  readonly yearlyPrice: string;
  readonly buttonText: string;
  readonly badge?: undefined | string;
  readonly features: {
    readonly name: string;
    readonly icon: string;
    readonly iconColor?: undefined | string;
  }[];
}

export interface CurrentPlan {
  readonly plan: Plan;
  readonly type: "monthly" | "yearly" | "custom";
  readonly price?: undefined | string;
  readonly nextBillingDate: string;
  readonly paymentMethod: string;
  readonly status: "active" | "inactive" | "past_due" | "cancelled";
}

export const plans: Plan[] = [
  {
    id: "starter",
    title: "Starter",
    description: "For developers testing out Liveblocks locally.",
    currency: "$",
    monthlyPrice: "0",
    yearlyPrice: "0",
    buttonText: "Start today for free",
    features: [
      {
        name: "Presence",
        icon: "check",
        iconColor: "text-green-500",
      },
      {
        name: "Comments",
        icon: "check",
        iconColor: "text-orange-500",
      },
      {
        name: "Notifications",
        icon: "check",
        iconColor: "text-teal-500",
      },
      {
        name: "Text Editor",
        icon: "check",
        iconColor: "text-blue-500",
      },
      {
        name: "Sync Datastore",
        icon: "check",
        iconColor: "text-zinc-500",
      },
    ],
  },
  {
    id: "pro",
    title: "Pro",
    description: "For companies adding collaboration in production.",
    currency: "$",
    monthlyPrice: "20",
    yearlyPrice: "199",
    buttonText: "Sign up",
    badge: "Most popular",
    highlight: true,
    features: [
      {
        name: "Presence",
        icon: "check",
        iconColor: "text-green-500",
      },
      {
        name: "Comments",
        icon: "check",
        iconColor: "text-orange-500",
      },
      {
        name: "Notifications",
        icon: "check",
        iconColor: "text-teal-500",
      },
      {
        name: "Text Editor",
        icon: "check",
        iconColor: "text-blue-500",
      },
      {
        name: "Sync Datastore",
        icon: "check",
        iconColor: "text-zinc-500",
      },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    description: "For organizations that need more support and compliance features.",
    currency: "$",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    buttonText: "Contact sales",
    features: [
      {
        name: "Presence",
        icon: "check",
        iconColor: "text-green-500",
      },
      {
        name: "Comments",
        icon: "check",
        iconColor: "text-orange-500",
      },
      {
        name: "Notifications",
        icon: "check",
        iconColor: "text-teal-500",
      },
      {
        name: "Text Editor",
        icon: "check",
        iconColor: "text-blue-500",
      },
      {
        name: "Sync Datastore",
        icon: "check",
        iconColor: "text-zinc-500",
      },
    ],
  },
];

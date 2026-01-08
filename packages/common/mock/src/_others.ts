import { _lastActivity } from "@beep/mock/_time";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { _mock } from "./_mock";
// ----------------------------------------------------------------------

export const _carouselsMembers = A.makeBy(6, (index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  role: _mock.role(index),
  avatarUrl: _mock.image.portrait(index),
}));

// ----------------------------------------------------------------------

export const _faqs = A.makeBy(8, (index) => ({
  id: _mock.id(index),
  value: `panel${index + 1}`,
  title: `Questions ${index + 1}`,
  content: _mock.description(index),
}));

// ----------------------------------------------------------------------

export const _addressBooks = A.makeBy(24, (index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  email: _mock.email(index + 1),
  fullAddress: _mock.fullAddress(index),
  phoneNumber: _mock.phoneNumber(index),
  company: _mock.companyNames(index + 1),
  addressType: index === 0 ? "Home" : "Office",
}));

// ----------------------------------------------------------------------

export const _contacts = A.makeBy(20, (index) => {
  const status = (index % 2 && "online") || (index % 3 && "offline") || (index % 4 && "always") || "busy";

  return {
    id: _mock.id(index),
    status,
    role: _mock.role(index),
    email: _mock.email(index),
    name: _mock.fullName(index),
    phoneNumber: _mock.phoneNumber(index),
    lastActivity: _lastActivity[index]!,
    avatarUrl: _mock.image.avatar(index),
    address: _mock.fullAddress(index),
  };
});
const _notificationTypes = [
  "friend",
  "project",
  "file",
  "tags",
  "payment",
  "order",
  "delivery",
  "chat",
  "mail",
] as const;

const _notificationCategories = [
  "Communication",
  "Project UI",
  "File manager",
  "File manager",
  "File manager",
  "Order",
  "Order",
  "Communication",
  "Communication",
] as const;
const _notificationCreatedAt = F.pipe(_lastActivity, A.take(9));
const _notificationTitles = [
  `<p><strong>Deja Brady</strong> sent you a friend request</p>`,
  `<p><strong>Jayvon Hull</strong> mentioned you in <strong><a href='#'>Minimal UI</a></strong></p>`,
  `<p><strong>Lainey Davidson</strong> added file to <strong><a href='#'>File manager</a></strong></p>`,
  `<p><strong>Angelique Morse</strong> added new tags to <strong><a href='#'>File manager</a></strong></p>`,
  `<p><strong>Giana Brandt</strong> request a payment of <strong>$200</strong></p>`,
  `<p>Your order is placed waiting for shipping</p>`,
  `<p>Delivery processing your order is being shipped</p>`,
  `<p>You have new message 5 unread messages</p>`,
  `<p>You have new mail</p>`,
] as const;
export const _notifications = A.map(_notificationCreatedAt, (createdAt, index) => {
  const avatarUrl = _mock.image.avatar(index);

  return {
    id: _mock.id(index)!,
    avatarUrl,
    type: _notificationTypes[index]!,
    category: _notificationCategories[index]!,
    isUnread: false,
    createdAt,
    title: _notificationTitles[index]!,
  };
});

// ----------------------------------------------------------------------

export const _mapContact = [
  { latlng: [33, 65], address: _mock.fullAddress(1), phoneNumber: _mock.phoneNumber(1) },
  { latlng: [-12.5, 18.5], address: _mock.fullAddress(2), phoneNumber: _mock.phoneNumber(2) },
] as const;

// ----------------------------------------------------------------------

export const _socials = [
  {
    value: "facebook",
    label: "Facebook",
    path: "https://www.facebook.com/caitlyn.kerluke",
  },
  {
    value: "instagram",
    label: "Instagram",
    path: "https://www.instagram.com/caitlyn.kerluke",
  },
  {
    value: "linkedin",
    label: "Linkedin",
    path: "https://www.linkedin.com/caitlyn.kerluke",
  },
  {
    value: "twitter",
    label: "Twitter",
    path: "https://www.twitter.com/caitlyn.kerluke",
  },
] as const;

// ----------------------------------------------------------------------

export const _pricingPlans = [
  {
    subscription: "basic",
    price: 0,
    caption: "Forever",
    lists: ["3 prototypes", "3 boards", "Up to 5 team members"],
    labelAction: "Current plan",
  },
  {
    subscription: "starter",
    price: 4.99,
    caption: "Saving $24 a year",
    lists: ["3 prototypes", "3 boards", "Up to 5 team members", "Advanced security", "Issue escalation"],
    labelAction: "Choose starter",
  },
  {
    subscription: "premium",
    price: 9.99,
    caption: "Saving $124 a year",
    lists: [
      "3 prototypes",
      "3 boards",
      "Up to 5 team members",
      "Advanced security",
      "Issue escalation",
      "Issue development license",
      "Permissions & workflows",
    ],
    labelAction: "Choose premium",
  },
] as const;

// ----------------------------------------------------------------------

export const _testimonials = [
  {
    name: _mock.fullName(1),
    postedDate: _lastActivity[1]!,
    ratingNumber: _mock.number.rating(1),
    avatarUrl: _mock.image.avatar(1),
    content: `Excellent Work! Thanks a lot!`,
  },
  {
    name: _mock.fullName(2),
    postedDate: _lastActivity[2]!,
    ratingNumber: _mock.number.rating(2),
    avatarUrl: _mock.image.avatar(2),
    content: `It's a very good dashboard and we are really liking the product . We've done some things, like migrate to TS and implementing a react useContext api, to fit our job methodology but the product is one of the best in terms of design and application architecture. The team did a really good job.`,
  },
  {
    name: _mock.fullName(3),
    postedDate: _lastActivity[3]!,
    ratingNumber: _mock.number.rating(3),
    avatarUrl: _mock.image.avatar(3),
    content: `Customer support is realy fast and helpful the desgin of this theme is looks amazing also the code is very clean and readble realy good job !`,
  },
  {
    name: _mock.fullName(4),
    postedDate: _lastActivity[4]!,
    ratingNumber: _mock.number.rating(4),
    avatarUrl: _mock.image.avatar(4),
    content: `Amazing, really good code quality and gives you a lot of examples for implementations.`,
  },
  {
    name: _mock.fullName(5),
    postedDate: _lastActivity[5]!,
    ratingNumber: _mock.number.rating(5),
    avatarUrl: _mock.image.avatar(5),
    content: `Got a few questions after purchasing the product. The owner responded very fast and very helpfull. Overall the code is excellent and works very good. 5/5 stars!`,
  },
  {
    name: _mock.fullName(6),
    postedDate: _lastActivity[6]!,
    ratingNumber: _mock.number.rating(6),
    avatarUrl: _mock.image.avatar(6),
    content: `CEO of Codealy.io here. We’ve built a developer assessment platform that makes sense - tasks are based on git repositories and run in virtual machines. We automate the pain points - storing candidates code, running it and sharing test results with the whole team, remotely. Bought this template as we need to provide an awesome dashboard for our early customers. I am super happy with purchase. The code is just as good as the design. Thanks!`,
  },
] as const;

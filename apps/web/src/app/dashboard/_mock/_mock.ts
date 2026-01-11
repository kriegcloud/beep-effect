import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as F from "effect/Function";
import * as O from "effect/Option";

export const _roles = [
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
] as const;
const _mock = {
  image: {
    cover: (index: number) => `/assets/images/mock/cover/cover-${index + 1}.webp`,
    avatar: (index: number) => `/assets/images/mock/avatar/avatar-${index + 1}.webp`,
    travel: (index: number) => `/assets/images/mock/travel/travel-${index + 1}.webp`,
    course: (index: number) => `/assets/images/mock/course/course-${index + 1}.webp`,
    company: (index: number) => `/assets/images/mock/company/company-${index + 1}.webp`,
    product: (index: number) => `/assets/images/mock/m-product/product-${index + 1}.webp`,
    portrait: (index: number) => `/assets/images/mock/portrait/portrait-${index + 1}.webp`,
  },
  role: (index: number) => _roles[index]!,
};
const fakeId = F.constant(faker.string.uuid());

export const _contacts = A.makeBy(20, (index) => {
  const status = (index % 2 && "online") || (index % 3 && "offline") || (index % 4 && "always") || "busy";

  return {
    id: fakeId(),
    status,
    role: faker.person.jobTitle(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number(),
    lastActivity: _lastActivity(index),
    avatarUrl: _mock.image.avatar(index),
    address: faker.location.streetAddress(),
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

export const _activities = A.makeBy(20, (index) =>
  F.pipe(
    DateTime.unsafeMake({
      year: 2024,
      month: 0,
      hours: 12,
      minutes: 0,
      day: 1,
      seconds: 0,
    }),
    DateTime.toUtc,
    DateTime.subtractDuration(index),
    DateTime.toEpochMillis,
    Duration.millis,
    Duration.times(
      Duration.toMillis(Duration.sum(Duration.toMillis(Duration.hours(1)), Duration.toMillis(Duration.days(1))))
    ),
    Duration.toMillis,
    DateTime.unsafeMake,
    DateTime.formatIsoDateUtc
  )
);

export const _lastActivity = (index: number) => F.pipe(A.get(index)(_activities), O.getOrThrow);
const _notificationCreatedAt = F.pipe(_activities, A.take(9));
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
export const _id = A.makeBy(40, (index) => `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${index + 1}`);
export const _notifications = A.map(_notificationCreatedAt, (createdAt, index) => {
  return {
    id: fakeId(),
    avatarUrl: faker.image.avatar(),
    type: _notificationTypes[index]!,
    category: _notificationCategories[index]!,
    isUnread: false,
    createdAt,
    title: _notificationTitles[index]!,
  };
});

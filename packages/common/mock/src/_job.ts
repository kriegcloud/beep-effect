import { _lastActivity } from "@beep/mock/_time";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { _mock } from "./_mock";

// ----------------------------------------------------------------------

export const JOB_DETAILS_TABS = [
  { label: "Job content", value: "content" },
  { label: "Candidates", value: "candidates" },
] as const;

export const JOB_SKILL_OPTIONS = [
  "UI",
  "UX",
  "Html",
  "JavaScript",
  "TypeScript",
  "Communication",
  "Problem Solving",
  "Leadership",
  "Time Management",
  "Adaptability",
  "Collaboration",
  "Creativity",
  "Critical Thinking",
  "Technical Skills",
  "Customer Service",
  "Project Management",
  "Problem Diagnosis",
] as const;

export const JOB_WORKING_SCHEDULE_OPTIONS = ["Monday to Friday", "Weekend availability", "Day shift"] as const;

export const JOB_EMPLOYMENT_TYPE_OPTIONS = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "On demand", value: "On demand" },
  { label: "Negotiable", value: "Negotiable" },
] as const;

export const JOB_EXPERIENCE_OPTIONS = [
  { label: "No experience", value: "No experience" },
  { label: "1 year exp", value: "1 year exp" },
  { label: "2 year exp", value: "2 year exp" },
  { label: "> 3 year exp", value: "> 3 year exp" },
] as const;

export const JOB_BENEFIT_OPTIONS = [
  { label: "Free parking", value: "Free parking" },
  { label: "Bonus commission", value: "Bonus commission" },
  { label: "Travel", value: "Travel" },
  { label: "Device support", value: "Device support" },
  { label: "Health care", value: "Health care" },
  { label: "Training", value: "Training" },
  { label: "Health insurance", value: "Health insurance" },
  { label: "Retirement plans", value: "Retirement plans" },
  { label: "Paid time off", value: "Paid time off" },
  { label: "Flexible work schedule", value: "Flexible work schedule" },
] as const;

export const JOB_PUBLISH_OPTIONS = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
] as const;

export const JOB_SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
  { label: "Oldest", value: "oldest" },
] as const;

const CANDIDATES = A.makeBy(12, (index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
}));

const CONTENT = `
<h6>Job description</h6>

<p>Occaecati est et illo quibusdam accusamus qui. Incidunt aut et molestiae ut facere aut. Est quidem iusto praesentium excepturi harum nihil tenetur facilis. Ut omnis voluptates nihil accusantium doloribus eaque debitis.</p>

<h6>Key responsibilities</h6>

<ul>
  <li>Collaborate with agencies to finalize design drawings, obtain quotations, and coordinate local production.</li>
  <li>Oversee the production of window displays, signage, interior setups, floor plans, and special promotional displays.</li>
  <li>Update and refresh displays to support new product launches, festive campaigns, and seasonal promotions.</li>
  <li>Plan and manage store openings, renovations, and closing procedures to ensure smooth execution.</li>
  <li>Monitor and follow up on store maintenance activities and maintain accurate SKU in/out records.</li>
  <li>Control expenses and ensure all activities stay within the approved budget.</li>
  <li>Work closely with suppliers to source materials, props, and display elements.</li>
</ul>

<h6>Why You'll love working here</h6>

<ul>
  <li>Be part of creative projects from concept to execution, working with leading design agencies and production teams.</li>
  <li>Gain hands-on experience in retail space transformation, from window displays to full store setups.</li>
  <li>Play a key role in promoting new collections, festive themes, and brand campaigns.</li>
  <li>Contribute to meaningful store projects including openings, renovations, and exciting launch events.</li>
  <li>Work in a dynamic environment where your ideas and attention to detail make a visible impact on customer experience.</li>
  <li>Collaborate with suppliers and partners to bring creative concepts to life, all while managing costs effectively.</li>
</ul>
`;

export const _jobs = A.makeBy(12, (index) => {
  const publish = index % 3 ? "published" : "draft";

  const salary = {
    type: (index % 5 && "Custom") || "Hourly",
    price: _mock.number.price(index),
    negotiable: _mock.boolean(index),
  };

  const benefits = F.pipe(
    JOB_BENEFIT_OPTIONS,
    A.take(3),
    A.map((option) => option.label)
  );

  const experience = F.pipe(
    JOB_EXPERIENCE_OPTIONS,
    A.map((option) => option.label),
    A.get(index),
    O.getOrElse(() => JOB_EXPERIENCE_OPTIONS[1].label)
  );

  const employmentTypes = (index % 2 && ["Part-time"]) ||
    (index % 3 && ["On demand"]) ||
    (index % 4 && ["Negotiable"]) || ["Full-time"];

  const company = {
    name: _mock.companyNames(index),
    logo: _mock.image.company(index),
    phoneNumber: _mock.phoneNumber(index),
    fullAddress: _mock.fullAddress(index),
  };

  return {
    id: _mock.id(index),
    salary,
    publish,
    company,
    benefits,
    experience,
    employmentTypes,
    content: CONTENT,
    candidates: CANDIDATES,
    role: _mock.role(index),
    title: _mock.jobTitle(index),
    createdAt: _lastActivity[index]!,
    expiredDate: _lastActivity[index]!,
    skills: JOB_SKILL_OPTIONS.slice(0, 3),
    totalViews: _mock.number.nativeL(index),
    locations: [_mock.countryNames(1), _mock.countryNames(2)],
    workingSchedule: JOB_WORKING_SCHEDULE_OPTIONS.slice(0, 2),
  };
});

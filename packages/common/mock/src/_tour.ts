import * as A from "effect/Array";

import { _lastActivity } from "@beep/mock/_time";
import { _mock } from "./_mock";
import { _tags } from "./assets";

// ----------------------------------------------------------------------

export const TOUR_DETAILS_TABS = [
  { label: "Tour content", value: "content" },
  { label: "Booker", value: "bookers" },
] as const;

export const TOUR_SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
  { label: "Oldest", value: "oldest" },
] as const;

export const TOUR_PUBLISH_OPTIONS = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
] as const;

export const TOUR_SERVICE_OPTIONS = [
  { label: "Audio guide", value: "Audio guide" },
  { label: "Food and drinks", value: "Food and drinks" },
  { label: "Lunch", value: "Lunch" },
  { label: "Private tour", value: "Private tour" },
  { label: "Special activities", value: "Special activities" },
  { label: "Entrance fees", value: "Entrance fees" },
  { label: "Gratuities", value: "Gratuities" },
  { label: "Pick-up and drop off", value: "Pick-up and drop off" },
  { label: "Professional guide", value: "Professional guide" },
  { label: "Transport by air-conditioned", value: "Transport by air-conditioned" },
] as const;

const CONTENT = `
<h6>Description</h6>

<p>Occaecati est et illo quibusdam accusamus qui. Incidunt aut et molestiae ut facere aut. Est quidem iusto praesentium excepturi harum nihil tenetur facilis. Ut omnis voluptates nihil accusantium doloribus eaque debitis.</p>

<h6>Highlights</h6>

<ul>
  <li>A fermentum in morbi pretium aliquam adipiscing donec tempus.</li>
  <li>Vulputate placerat amet pulvinar lorem nisl.</li>
  <li>Consequat feugiat habitant gravida quisque elit bibendum id adipiscing sed.</li>
  <li>Etiam duis lobortis in fames ultrices commodo nibh.</li>
</ul>

<h6>Program</h6>

<p>
  <strong>Day 1</strong>
</p>

<p>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>

<p>
  <strong>Day 2</strong>
</p>

<p>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>

<p>
  <strong>Day 3</strong>
</p>

<p>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>
`;

const BOOKER = A.makeBy(12, (index) => ({
  id: _mock.id(index),
  guests: index + 10,
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _tourGuides = A.makeBy(12, (index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
  phoneNumber: _mock.phoneNumber(index),
}));

export const TRAVEL_IMAGES = A.makeBy(16, (index) => _mock.image.travel(index));

export const _tours = A.makeBy(12, (index) => {
  const available = { startDate: _lastActivity[index + 1]!, endDate: _lastActivity[index]! };

  const publish = index % 3 ? "published" : "draft";

  const services =
    (index % 2 && ["Audio guide", "Food and drinks"]) ||
    (index % 3 && ["Lunch", "Private tour"]) ||
    (index % 4 && ["Special activities", "Entrance fees"]) ||
    (["Gratuities", "Pick-up and drop off", "Professional guide", "Transport by air-conditioned"] as const);

  const tourGuides =
    (index === 0 && _tourGuides.slice(0, 1)) ||
    (index === 1 && _tourGuides.slice(1, 3)) ||
    (index === 2 && _tourGuides.slice(2, 5)) ||
    (index === 3 && _tourGuides.slice(4, 6)) ||
    _tourGuides.slice(6, 9);

  const images = TRAVEL_IMAGES.slice(index, index + 5);

  return {
    images,
    publish,
    services,
    available,
    tourGuides,
    bookers: BOOKER,
    content: CONTENT,
    id: _mock.id(index),
    tags: _tags.slice(0, 5),
    name: _mock.tourName(index),
    createdAt: _lastActivity[index]!,
    durations: "4 days 3 nights",
    price: _mock.number.price(index),
    destination: _mock.countryNames(index),
    priceSale: _mock.number.price(index),
    totalViews: _mock.number.nativeL(index),
    ratingNumber: _mock.number.rating(index),
  };
});

import { _lastActivity } from "@beep/mock/_time";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

import { _mock } from "./_mock";
import { _fileNames, _tags } from "./assets";

// ----------------------------------------------------------------------

const GB = 1000000000 * 24;

const FOLDERS = ["Docs", "Projects", "Work", "Training", "Sport", "Foods"] as const;

const URLS = [
  _mock.image.cover(1),
  "https://www.cloud.com/s/c218bo6kjuqyv66/design_suriname_2015.mp3",
  "https://www.cloud.com/s/c218bo6kjuqyv66/expertise_2015_conakry_sao-tome-and-principe_gender.mp4",
  "https://www.cloud.com/s/c218bo6kjuqyv66/money-popup-crack.pdf",
  _mock.image.cover(3),
  _mock.image.cover(5),
  "https://www.cloud.com/s/c218bo6kjuqyv66/large_news.txt",
  "https://www.cloud.com/s/c218bo6kjuqyv66/nauru-6015-small-fighter-left-gender.psd",
  "https://www.cloud.com/s/c218bo6kjuqyv66/tv-xs.doc",
  "https://www.cloud.com/s/c218bo6kjuqyv66/gustavia-entertainment-productivity.docx",
  "https://www.cloud.com/s/c218bo6kjuqyv66/vintage_bahrain_saipan.xls",
  "https://www.cloud.com/s/c218bo6kjuqyv66/indonesia-quito-nancy-grace-left-glad.xlsx",
  "https://www.cloud.com/s/c218bo6kjuqyv66/legislation-grain.zip",
  "https://www.cloud.com/s/c218bo6kjuqyv66/large_energy_dry_philippines.rar",
  "https://www.cloud.com/s/c218bo6kjuqyv66/footer-243-ecuador.iso",
  "https://www.cloud.com/s/c218bo6kjuqyv66/kyrgyzstan-04795009-picabo-street-guide-style.ai",
  "https://www.cloud.com/s/c218bo6kjuqyv66/india-data-large-gk-chesterton-mother.eps",
  "https://www.cloud.com/s/c218bo6kjuqyv66/footer-barbados-celine-dion.ppt",
  "https://www.cloud.com/s/c218bo6kjuqyv66/socio_respectively_366996.pptx",
  "https://www.cloud.com/s/c218bo6kjuqyv66/socio_ahead_531437_sweden_popup.wav",
  "https://www.cloud.com/s/c218bo6kjuqyv66/trinidad_samuel-morse_bring.m4v",
  _mock.image.cover(11),
  _mock.image.cover(17),
  "https://www.cloud.com/s/c218bo6kjuqyv66/xl_david-blaine_component_tanzania_books.pdf",
] as const;

const SHARED_PERSONS = Array.from({ length: 20 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  email: _mock.email(index),
  avatarUrl: _mock.image.avatar(index),
  permission: index % 2 ? "view" : "edit",
}));

export const FILE_TYPE_OPTIONS = [
  "folder",
  "txt",
  "zip",
  "audio",
  "image",
  "video",
  "word",
  "excel",
  "powerpoint",
  "pdf",
  "photoshop",
  "illustrator",
];

// ----------------------------------------------------------------------

const shared = (index: number) =>
  (index === 0 && SHARED_PERSONS.slice(0, 5)) ||
  (index === 1 && SHARED_PERSONS.slice(5, 9)) ||
  (index === 2 && SHARED_PERSONS.slice(9, 11)) ||
  (index === 3 && SHARED_PERSONS.slice(11, 12)) ||
  [];

export const _folders = F.pipe(
  FOLDERS,
  A.map((name, index) => ({
    id: `${_mock.id(index)}_folder`,
    name,
    type: "folder",
    url: URLS[index]!,
    shared: shared(index),
    tags: _tags.slice(0, 5),
    size: GB / ((index + 1) * 10),
    totalFiles: (index + 1) * 100,
    createdAt: _lastActivity[index]!,
    modifiedAt: _lastActivity[index]!,
    isFavorited: _mock.boolean(index + 1),
  }))
);

export const _files = F.pipe(
  _fileNames,
  A.map((name, index) => ({
    id: `${_mock.id(index)}_file`,
    name,
    url: URLS[index]!,
    shared: shared(index),
    tags: _tags.slice(0, 5),
    size: GB / ((index + 1) * 500),
    createdAt: _lastActivity[index]!,
    modifiedAt: _lastActivity[index]!,
    type: F.pipe(
      name,
      Str.split("."),
      A.last,
      O.getOrElse(() => "")
    ),
    isFavorited: _mock.boolean(index + 1),
  }))
);

export const _allFiles = [..._folders, ..._files] as const;

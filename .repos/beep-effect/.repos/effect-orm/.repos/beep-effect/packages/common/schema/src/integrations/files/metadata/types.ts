import { $SchemaId } from "@beep/identity/packages";
import { LiteralKit, MappedLiteralKit, StringLiteralKit } from "@beep/schema/derived";
import { DateTimeUtcFromAllAcceptable } from "@beep/schema/primitives";
import * as S from "effect/Schema";

const $I = $SchemaId.create("integrations/files/metadata/types");
const withNullableOption = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.optionalWith(schema, {
    as: "Option",
    nullable: true,
  });
export class IPicture extends S.Class<IPicture>($I`IPicture`)(
  {
    format: S.String.annotations({ description: "Image mime type" }),
    data: S.Uint8ArrayFromSelf.annotations({ description: "Image data as binary buffer" }),
    description: withNullableOption(S.String).annotations({
      description: "Optional textual description of the picture",
    }),
    type: withNullableOption(S.String).annotations({ description: "Optional picture type" }),
    name: withNullableOption(S.String).annotations({ description: "Optional file name" }),
  },
  $I.annotations("IPicture", {
    description: "Attached picture, typically used for cover art",
  })
) {}
export class IRating extends S.Class<IRating>($I`IRating`)(
  {
    source: withNullableOption(S.String).annotations({
      description: "Optional rating source, could be an e-mail address",
    }),
    rating: withNullableOption(S.NonNegativeInt).annotations({
      description: "Optional rating value [0..1]",
    }),
  },
  $I.annotations("IRating", {
    description: "Abstract interface to access rating information",
  })
) {}

export class IComment extends S.Class<IComment>($I`IComment`)(
  {
    descriptor: withNullableOption(S.String).annotations({
      description: "Optional comment descriptor",
    }),
    language: withNullableOption(S.String).annotations({
      description: "Optional language code for the comment",
    }),
    text: withNullableOption(S.String).annotations({
      description: "Optional comment text content",
    }),
  },
  $I.annotations("IComment", {
    description: "Comment structure for audio metadata",
  })
) {}

export class ILyricsText extends S.Class<ILyricsText>($I`ILyricsText`)(
  {
    text: S.String.annotations({ description: "Lyrics text content" }),
    timestamp: withNullableOption(DateTimeUtcFromAllAcceptable).annotations({
      description: "Optional timestamp for synchronized lyrics",
    }),
  },
  $I.annotations("ILyricsText", {
    description: "Synchronized lyrics text with optional timestamp",
  })
) {}

export class AttachedPictureType extends MappedLiteralKit(
  [0, "Other"],
  [1, "32x32 pixels 'file icon' (PNG only)"],
  [2, "Other file icon"],
  [3, "Cover (front)"],
  [4, "Cover (back)"],
  [5, "Leaflet page"],
  [6, "Media (e.g. label side of CD)"],
  [7, "Lead artist/lead performer/soloist"],
  [8, "Artist/performer"],
  [9, "Conductor"],
  [10, "Band/Orchestra"],
  [11, "Composer"],
  [12, "Lyricist/text writer"],
  [13, "Recording Location"],
  [14, "During recording"],
  [15, "During performance"],
  [16, "Movie/video screen capture"],
  [17, "A bright coloured fish"],
  [18, "Illustration"],
  [19, "Band/artist logotype"],
  [20, "Publisher/Studio logotype"]
).annotations(
  $I.annotations("AttachedPictureType", {
    description: "ID3v2 attached picture type mapping from numeric code to description",
  })
) {}

export declare namespace AttachedPictureType {
  export type Type = typeof AttachedPictureType.Type;
  export type Encoded = typeof AttachedPictureType.Encoded;
}

export class ID3v2MajorVersion extends LiteralKit(2, 3, 4).annotations(
  $I.annotations("ID3v2MajorVersion", {
    description: "ID3v2 major version number (2, 3, or 4)",
  })
) {}

export declare namespace ID3v2MajorVersion {
  export type Type = typeof ID3v2MajorVersion.Type;
  export type Encoded = typeof ID3v2MajorVersion.Encoded;
}

export class IExtendedHeader extends S.Class<IExtendedHeader>($I`IExtendedHeader`)(
  {
    size: S.NonNegativeInt.annotations({ description: "Extended header size in bytes" }),
    extendsFlags: S.Number.annotations({ description: "Extended header flags" }),
    sizeOfPadding: S.Number.annotations({ description: "Size of padding in bytes" }),
    crcDataPresent: S.Boolean.annotations({ description: "Whether CRC data is present" }),
  },
  $I.annotations("IExtendedHeader", {
    description: "ID3v2 extended header structure",
  })
) {}

export class LyricsContentType extends StringLiteralKit(
  "other",
  "lyrics",
  "text",
  "movement_part",
  "events",
  "chord",
  "trivia_pop"
).annotations(
  $I.annotations("LyricsContentType", {
    description: "Lyrics content type string literals for categorizing synchronized lyrics",
  })
) {}

export declare namespace LyricsContentType {
  export type Type = typeof LyricsContentType.Type;
  export type Encoded = typeof LyricsContentType.Encoded;
}

export class LyricsContentTypeFromNumber extends MappedLiteralKit(
  [0, "other"],
  [1, "lyrics"],
  [2, "text"],
  [3, "movement_part"],
  [4, "events"],
  [5, "chord"],
  [6, "trivia_pop"]
).annotations(
  $I.annotations("LyricsContentTypeFromNumber", {
    description: "Lyrics content type mapping from numeric code to string literal",
  })
) {}

export declare namespace LyricsContentTypeFromNumber {
  export type Type = typeof LyricsContentTypeFromNumber.Type;
  export type Encoded = typeof LyricsContentTypeFromNumber.Encoded;
}

/**
 * Schema that accepts any number for LyricsContentType and transforms to string.
 * Uses filter to validate the number is a valid LyricsContentType value.
 */
const LyricsContentTypeNumber = S.Number.pipe(
  S.filter((n): n is 0 | 1 | 2 | 3 | 4 | 5 | 6 => [0, 1, 2, 3, 4, 5, 6].includes(n), {
    message: () => "Invalid LyricsContentType value",
  }),
  S.transform(LyricsContentType, {
    decode: (n) => LyricsContentTypeFromNumber.decodeMap.get(n as 0 | 1 | 2 | 3 | 4 | 5 | 6)!,
    encode: (s) => LyricsContentTypeFromNumber.encodeMap.get(s)!,
  })
);

export class TimestampFormat extends StringLiteralKit("notSynchronized", "mpegFrameNumber", "milliseconds").annotations(
  $I.annotations("TimestampFormat", {
    description: "Timestamp format for synchronized lyrics timing",
  })
) {}

export declare namespace TimestampFormat {
  export type Type = typeof TimestampFormat.Type;
  export type Encoded = typeof TimestampFormat.Encoded;
}

export class TimestampFormatFromNumber extends MappedLiteralKit(
  [0, "notSynchronized"],
  [1, "mpegFrameNumber"],
  [2, "milliseconds"]
).annotations(
  $I.annotations("TimestampFormatFromNumber", {
    description: "Timestamp format mapping from numeric code to string literal",
  })
) {}

export declare namespace TimestampFormatFromNumber {
  export type Type = typeof TimestampFormatFromNumber.Type;
  export type Encoded = typeof TimestampFormatFromNumber.Encoded;
}

/**
 * Schema that accepts any number for TimestampFormat and transforms to string.
 * Uses filter to validate the number is a valid TimestampFormat value.
 */
const TimestampFormatNumber = S.Number.pipe(
  S.filter((n): n is 0 | 1 | 2 => [0, 1, 2].includes(n), { message: () => "Invalid TimestampFormat value" }),
  S.transform(TimestampFormat, {
    decode: (n) => TimestampFormatFromNumber.decodeMap.get(n as 0 | 1 | 2)!,
    encode: (s) => TimestampFormatFromNumber.encodeMap.get(s)!,
  })
);

export class IID3v2header extends S.Class<IID3v2header>($I`IID3v2header`)(
  {
    fileIdentifier: S.String.annotations({ description: "ID3v2/file identifier - should be 'ID3'" }),
    version: S.Struct({
      major: ID3v2MajorVersion.annotations({ description: "ID3v2 major version" }),
      revision: S.Number.annotations({ description: "ID3v2 revision number" }),
    }).annotations({ description: "ID3v2 version information" }),
    flags: S.Struct({
      unsynchronisation: S.Boolean.annotations({ description: "Unsynchronisation flag" }),
      isExtendedHeader: S.Boolean.annotations({ description: "Extended header present flag" }),
      expIndicator: S.Boolean.annotations({ description: "Experimental indicator flag" }),
      footer: S.Boolean.annotations({ description: "Footer present flag" }),
    }).annotations({ description: "ID3v2 header flags" }),
    size: S.Number.annotations({ description: "Total tag size in bytes" }),
  },
  $I.annotations("IID3v2header", {
    description: "ID3v2 header structure containing version, flags, and size information",
  })
) {}

export class ILyricsTag extends IComment.extend<ILyricsTag>($I`ILyricsTag`)(
  {
    contentType: LyricsContentTypeNumber.annotations({
      description: "Content type of the lyrics",
    }),
    timeStampFormat: TimestampFormatNumber.annotations({
      description: "Format used for timestamp synchronization",
    }),
    // Note: `text` is inherited from IComment (optional un-synchronized lyrics text content)
    syncText: S.Array(ILyricsText).annotations({
      description: "Synchronized lyrics with timestamps",
    }),
  },
  $I.annotations("ILyricsTag", {
    description: "Lyrics tag with content type, timestamp format, and synchronized text",
  })
) {}

export declare namespace ILyricsTag {
  export type Type = typeof ILyricsTag.Type;
  export type Encoded = typeof ILyricsTag.Encoded;
}

export class IRatio extends S.Class<IRatio>($I`IRatio`)(
  {
    ratio: S.Number.annotations({ description: "Ratio value [0..1]" }),
    dB: S.Number.annotations({ description: "Decibel value" }),
  },
  $I.annotations("IRatio", {
    description: "Ratio structure with linear ratio and decibel values",
  })
) {}

export class ICommonTagsResult extends S.Class<ICommonTagsResult>($I`ICommonTagsResult`)(
  {
    track: S.Struct({
      no: S.NullOr(S.Number).annotations({ description: "Track number" }),
      of: S.NullOr(S.Number).annotations({ description: "Total tracks" }),
    }).annotations({ description: "Track number and total" }),
    disk: S.Struct({
      no: S.NullOr(S.Number).annotations({ description: "Disc number" }),
      of: S.NullOr(S.Number).annotations({ description: "Total discs" }),
    }).annotations({ description: "Disc number and total" }),
    year: withNullableOption(S.Number).annotations({ description: "Optional release year" }),
    title: withNullableOption(S.String).annotations({ description: "Optional track title" }),
    artist: withNullableOption(S.String).annotations({
      description: "Optional track artist, maybe several artists written in a single string",
    }),
    artists: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional track artists, each artist in a different string",
    }),
    albumartist: withNullableOption(S.String).annotations({
      description: "Optional album artist",
    }),
    album: withNullableOption(S.String).annotations({ description: "Optional album title" }),
    date: withNullableOption(S.String).annotations({ description: "Optional date string" }),
    originaldate: withNullableOption(S.String).annotations({
      description: "Optional original release date",
    }),
    originalyear: withNullableOption(S.Number).annotations({
      description: "Optional original release year",
    }),
    releasedate: withNullableOption(S.String).annotations({
      description: "Optional release date",
    }),
    comment: withNullableOption(S.Array(IComment)).annotations({
      description: "Optional list of comments",
    }),
    genre: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional genre list",
    }),
    picture: withNullableOption(S.Array(IPicture)).annotations({
      description: "Optional embedded album art",
    }),
    composer: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional track composer(s)",
    }),
    lyrics: withNullableOption(S.Array(ILyricsTag)).annotations({
      description: "Optional synchronized lyrics",
    }),
    albumsort: withNullableOption(S.String).annotations({
      description: "Optional album title formatted for alphabetic ordering",
    }),
    titlesort: withNullableOption(S.String).annotations({
      description: "Optional track title formatted for alphabetic ordering",
    }),
    work: withNullableOption(S.String).annotations({
      description: "Optional canonical title of the work",
    }),
    artistsort: withNullableOption(S.String).annotations({
      description: "Optional track artist formatted for alphabetic ordering",
    }),
    albumartistsort: withNullableOption(S.String).annotations({
      description: "Optional album artist formatted for alphabetic ordering",
    }),
    composersort: withNullableOption(S.String).annotations({
      description: "Optional composer formatted for alphabetic ordering",
    }),
    lyricist: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional lyricist(s)",
    }),
    writer: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional writer(s)",
    }),
    conductor: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional conductor(s)",
    }),
    remixer: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional remixer(s)",
    }),
    arranger: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional arranger(s)",
    }),
    engineer: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional engineer(s)",
    }),
    publisher: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional publisher(s)",
    }),
    producer: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional producer(s)",
    }),
    djmixer: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional mix-DJ(s)",
    }),
    mixer: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional mixer(s)",
    }),
    technician: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional technician(s)",
    }),
    label: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional record label(s)",
    }),
    grouping: withNullableOption(S.String).annotations({
      description: "Optional grouping",
    }),
    subtitle: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional subtitle(s)",
    }),
    description: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional description(s)",
    }),
    longDescription: withNullableOption(S.String).annotations({
      description: "Optional long description",
    }),
    discsubtitle: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional disc subtitle(s)",
    }),
    totaltracks: withNullableOption(S.String).annotations({
      description: "Optional total tracks as string",
    }),
    totaldiscs: withNullableOption(S.String).annotations({
      description: "Optional total discs as string",
    }),
    movementTotal: withNullableOption(S.Number).annotations({
      description: "Optional total movements",
    }),
    compilation: withNullableOption(S.Boolean).annotations({
      description: "Optional compilation flag",
    }),
    rating: withNullableOption(S.Array(IRating)).annotations({
      description: "Optional rating(s)",
    }),
    bpm: withNullableOption(S.Number).annotations({
      description: "Optional beats per minute",
    }),
    mood: withNullableOption(S.String).annotations({
      description: "Optional mood keywords, e.g. 'Romantic' or 'Sad'",
    }),
    media: withNullableOption(S.String).annotations({
      description: "Optional release format, e.g. 'CD'",
    }),
    catalognumber: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional release catalog number(s)",
    }),
    tvShow: withNullableOption(S.String).annotations({
      description: "Optional TV show title",
    }),
    tvShowSort: withNullableOption(S.String).annotations({
      description: "Optional TV show title formatted for alphabetic ordering",
    }),
    tvSeason: withNullableOption(S.Number).annotations({
      description: "Optional TV season sequence number",
    }),
    tvEpisode: withNullableOption(S.Number).annotations({
      description: "Optional TV episode sequence number",
    }),
    tvEpisodeId: withNullableOption(S.String).annotations({
      description: "Optional TV episode ID",
    }),
    tvNetwork: withNullableOption(S.String).annotations({
      description: "Optional TV network",
    }),
    podcast: withNullableOption(S.Boolean).annotations({
      description: "Optional podcast flag",
    }),
    podcasturl: withNullableOption(S.String).annotations({
      description: "Optional podcast URL",
    }),
    releasestatus: withNullableOption(S.String).annotations({
      description: "Optional release status",
    }),
    releasetype: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional release type(s)",
    }),
    releasecountry: withNullableOption(S.String).annotations({
      description: "Optional release country",
    }),
    script: withNullableOption(S.String).annotations({
      description: "Optional script",
    }),
    language: withNullableOption(S.String).annotations({
      description: "Optional language",
    }),
    copyright: withNullableOption(S.String).annotations({
      description: "Optional copyright",
    }),
    license: withNullableOption(S.String).annotations({
      description: "Optional license",
    }),
    encodedby: withNullableOption(S.String).annotations({
      description: "Optional encoded by",
    }),
    encodersettings: withNullableOption(S.String).annotations({
      description: "Optional encoder settings",
    }),
    gapless: withNullableOption(S.Boolean).annotations({
      description: "Optional gapless playback flag",
    }),
    barcode: withNullableOption(S.String).annotations({
      description: "Optional barcode",
    }),
    isrc: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional International Standard Recording Code(s)",
    }),
    asin: withNullableOption(S.String).annotations({
      description: "Optional Amazon Standard Identification Number",
    }),
    musicbrainz_recordingid: withNullableOption(S.String).annotations({
      description: "Optional MusicBrainz recording ID",
    }),
    musicbrainz_trackid: withNullableOption(S.String).annotations({
      description: "Optional MusicBrainz track ID",
    }),
    musicbrainz_albumid: withNullableOption(S.String).annotations({
      description: "Optional MusicBrainz album ID",
    }),
    musicbrainz_artistid: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional MusicBrainz artist ID(s)",
    }),
    musicbrainz_albumartistid: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional MusicBrainz album artist ID(s)",
    }),
    musicbrainz_releasegroupid: withNullableOption(S.String).annotations({
      description: "Optional MusicBrainz release group ID",
    }),
    musicbrainz_workid: withNullableOption(S.String).annotations({
      description: "Optional MusicBrainz work ID",
    }),
    musicbrainz_trmid: withNullableOption(S.String).annotations({
      description: "Optional MusicBrainz TRM ID",
    }),
    musicbrainz_discid: withNullableOption(S.String).annotations({
      description: "Optional MusicBrainz disc ID",
    }),
    acoustid_id: withNullableOption(S.String).annotations({
      description: "Optional AcoustID",
    }),
    acoustid_fingerprint: withNullableOption(S.String).annotations({
      description: "Optional AcoustID fingerprint",
    }),
    musicip_puid: withNullableOption(S.String).annotations({
      description: "Optional MusicIP PUID",
    }),
    musicip_fingerprint: withNullableOption(S.String).annotations({
      description: "Optional MusicIP fingerprint",
    }),
    website: withNullableOption(S.String).annotations({
      description: "Optional website URL",
    }),
    "performer:instrument": withNullableOption(S.Array(S.String)).annotations({
      description: "Optional performer instrument credits",
    }),
    averageLevel: withNullableOption(S.Number).annotations({
      description: "Optional average audio level",
    }),
    peakLevel: withNullableOption(S.Number).annotations({
      description: "Optional peak audio level",
    }),
    notes: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional notes",
    }),
    originalalbum: withNullableOption(S.String).annotations({
      description: "Optional original album",
    }),
    originalartist: withNullableOption(S.String).annotations({
      description: "Optional original artist",
    }),
    discogs_artist_id: withNullableOption(S.Array(S.Number)).annotations({
      description: "Optional Discogs artist ID(s)",
    }),
    discogs_release_id: withNullableOption(S.Number).annotations({
      description: "Optional Discogs release ID",
    }),
    discogs_label_id: withNullableOption(S.Number).annotations({
      description: "Optional Discogs label ID",
    }),
    discogs_master_release_id: withNullableOption(S.Number).annotations({
      description: "Optional Discogs master release ID",
    }),
    discogs_votes: withNullableOption(S.Number).annotations({
      description: "Optional Discogs votes count",
    }),
    discogs_rating: withNullableOption(S.Number).annotations({
      description: "Optional Discogs rating",
    }),
    replaygain_track_gain_ratio: withNullableOption(S.Number).annotations({
      description: "Optional track gain ratio [0..1]",
    }),
    replaygain_track_peak_ratio: withNullableOption(S.Number).annotations({
      description: "Optional track peak ratio [0..1]",
    }),
    replaygain_track_gain: withNullableOption(IRatio).annotations({
      description: "Optional track gain ratio structure",
    }),
    replaygain_track_peak: withNullableOption(IRatio).annotations({
      description: "Optional track peak ratio structure",
    }),
    replaygain_album_gain: withNullableOption(IRatio).annotations({
      description: "Optional album gain ratio structure",
    }),
    replaygain_album_peak: withNullableOption(IRatio).annotations({
      description: "Optional album peak ratio structure",
    }),
    replaygain_undo: withNullableOption(
      S.Struct({
        leftChannel: S.Number.annotations({ description: "Left channel gain value" }),
        rightChannel: S.Number.annotations({ description: "Right channel gain value" }),
      })
    ).annotations({
      description: "Optional minimum and maximum global gain values across album files",
    }),
    replaygain_track_minmax: withNullableOption(S.Array(S.Number)).annotations({
      description: "Optional minimum and maximum global gain values across file",
    }),
    replaygain_album_minmax: withNullableOption(S.Array(S.Number)).annotations({
      description: "Optional minimum and maximum global gain values across album files",
    }),
    key: withNullableOption(S.String).annotations({
      description: "Optional initial key of the music, e.g. 'A Minor'",
    }),
    category: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional podcast category(s)",
    }),
    hdVideo: withNullableOption(S.Number).annotations({
      description: "Optional iTunes Video Quality (0: SD, 1: HD, 2: Full HD)",
    }),
    keywords: withNullableOption(S.Array(S.String)).annotations({
      description: "Optional podcast keywords",
    }),
    movement: withNullableOption(S.String).annotations({
      description: "Optional movement name",
    }),
    movementIndex: S.Struct({
      no: S.NullOr(S.Number).annotations({ description: "Movement number" }),
      of: S.NullOr(S.Number).annotations({ description: "Total movements" }),
    }).annotations({ description: "Movement index and total" }),
    podcastId: withNullableOption(S.String).annotations({
      description: "Optional podcast identifier",
    }),
    showMovement: withNullableOption(S.Boolean).annotations({
      description: "Optional show movement flag",
    }),
    stik: withNullableOption(S.Number).annotations({
      description:
        "Optional iTunes Media Type (1: Normal, 2: Audiobook, 6: Music Video, 9: Movie, 10: TV Show, 11: Booklet, 14: Ringtone)",
    }),
    playCounter: withNullableOption(S.Number).annotations({
      description: "Optional play counter",
    }),
  },
  $I.annotations("ICommonTagsResult", {
    description: "Common tags result containing normalized metadata from audio files",
  })
) {}

export class FormatId extends StringLiteralKit(
  "container",
  "duration",
  "bitrate",
  "sampleRate",
  "bitsPerSample",
  "codec",
  "tool",
  "codecProfile",
  "lossless",
  "numberOfChannels",
  "numberOfSamples",
  "audioMD5",
  "chapters",
  "modificationTime",
  "creationTime",
  "trackPeakLevel",
  "trackGain",
  "albumGain",
  "hasAudio",
  "hasVideo"
).annotations(
  $I.annotations("FormatId", {
    description: "Audio format property identifier for metadata events",
  })
) {}

export declare namespace FormatId {
  export type Type = typeof FormatId.Type;
  export type Encoded = typeof FormatId.Encoded;
}

export class IAudioTrack extends S.Class<IAudioTrack>($I`IAudioTrack`)(
  {
    samplingFrequency: withNullableOption(S.Number).annotations({
      description: "Optional sampling frequency in Hz",
    }),
    outputSamplingFrequency: withNullableOption(S.Number).annotations({
      description: "Optional output sampling frequency in Hz",
    }),
    channels: withNullableOption(S.Number).annotations({
      description: "Optional number of audio channels",
    }),
    channelPositions: withNullableOption(S.Uint8ArrayFromSelf).annotations({
      description: "Optional channel positions data",
    }),
    bitDepth: withNullableOption(S.Number).annotations({
      description: "Optional bit depth",
    }),
  },
  $I.annotations("IAudioTrack", {
    description: "Audio track information for container formats",
  })
) {}

export class IVideoTrack extends S.Class<IVideoTrack>($I`IVideoTrack`)(
  {
    flagInterlaced: withNullableOption(S.Boolean).annotations({
      description: "Optional interlaced video flag",
    }),
    stereoMode: withNullableOption(S.Number).annotations({
      description: "Optional stereo mode",
    }),
    pixelWidth: withNullableOption(S.Number).annotations({
      description: "Optional pixel width",
    }),
    pixelHeight: withNullableOption(S.Number).annotations({
      description: "Optional pixel height",
    }),
    displayWidth: withNullableOption(S.Number).annotations({
      description: "Optional display width",
    }),
    displayHeight: withNullableOption(S.Number).annotations({
      description: "Optional display height",
    }),
    displayUnit: withNullableOption(S.Number).annotations({
      description: "Optional display unit",
    }),
    aspectRatioType: withNullableOption(S.Number).annotations({
      description: "Optional aspect ratio type",
    }),
    colourSpace: withNullableOption(S.Uint8ArrayFromSelf).annotations({
      description: "Optional colour space data",
    }),
    gammaValue: withNullableOption(S.Number).annotations({
      description: "Optional gamma value",
    }),
  },
  $I.annotations("IVideoTrack", {
    description: "Video track information for container formats",
  })
) {}

// =============================================================================
// Phase 1: Enums and Simple Types
// =============================================================================

export class TagType extends StringLiteralKit(
  "vorbis",
  "ID3v1",
  "ID3v2.2",
  "ID3v2.3",
  "ID3v2.4",
  "APEv2",
  "asf",
  "iTunes",
  "exif",
  "matroska",
  "AIFF"
).annotations(
  $I.annotations("TagType", {
    description: "Tag format type identifier for audio metadata",
  })
) {}

export declare namespace TagType {
  export type Type = typeof TagType.Type;
  export type Encoded = typeof TagType.Encoded;
}

export class ParserType extends StringLiteralKit(
  "mpeg",
  "apev2",
  "mp4",
  "asf",
  "flac",
  "ogg",
  "aiff",
  "wavpack",
  "riff",
  "musepack",
  "dsf",
  "dsdiff",
  "adts",
  "matroska"
).annotations(
  $I.annotations("ParserType", {
    description: "Parser module name for audio format detection",
  })
) {}

export declare namespace ParserType {
  export type Type = typeof ParserType.Type;
  export type Encoded = typeof ParserType.Encoded;
}

export class TrackType extends StringLiteralKit(
  "video",
  "audio",
  "complex",
  "logo",
  "subtitle",
  "button",
  "control"
).annotations(
  $I.annotations("TrackType", {
    description: "Matroska track type string literals",
  })
) {}

export declare namespace TrackType {
  export type Type = typeof TrackType.Type;
  export type Encoded = typeof TrackType.Encoded;
}

export class TrackTypeFromNumber extends MappedLiteralKit(
  [0x01, "video"],
  [0x02, "audio"],
  [0x03, "complex"],
  [0x04, "logo"],
  [0x11, "subtitle"],
  [0x12, "button"],
  [0x20, "control"]
).annotations(
  $I.annotations("TrackTypeFromNumber", {
    description: "Matroska track type mapping from numeric code to string literal",
  })
) {}

export declare namespace TrackTypeFromNumber {
  export type Type = typeof TrackTypeFromNumber.Type;
  export type Encoded = typeof TrackTypeFromNumber.Encoded;
}

export class DataType extends MappedLiteralKit(
  ["text_utf8", 0],
  ["binary", 1],
  ["external_info", 2],
  ["reserved", 3]
).annotations(
  $I.annotations("DataType", {
    description: "APEv2 data type enumeration mapping",
  })
) {}

export declare namespace DataType {
  export type Type = typeof DataType.Type;
  export type Encoded = typeof DataType.Encoded;
}

export class MetadataEventType extends StringLiteralKit("common", "format").annotations(
  $I.annotations("MetadataEventType", {
    description: "Metadata event type - either common tag event or format related update",
  })
) {}

export declare namespace MetadataEventType {
  export type Type = typeof MetadataEventType.Type;
  export type Encoded = typeof MetadataEventType.Encoded;
}

// =============================================================================
// Phase 2: Simple Data Classes
// =============================================================================

export class ITag extends S.Class<ITag>($I`ITag`)(
  {
    id: S.String.annotations({ description: "Tag identifier" }),
    value: S.Unknown.annotations({
      description: "Tag value - AnyTagValue is just unknown in source",
    }),
  },
  $I.annotations("ITag", {
    description: "Generic tag structure for metadata key-value pairs",
  })
) {}

export class IParserWarning extends S.Class<IParserWarning>($I`IParserWarning`)(
  {
    message: S.String.annotations({ description: "Warning message text" }),
  },
  $I.annotations("IParserWarning", {
    description: "Parser warning message wrapper",
  })
) {}

export class ITagFlags extends S.Class<ITagFlags>($I`ITagFlags`)(
  {
    containsHeader: S.Boolean.annotations({ description: "Whether tag contains header" }),
    containsFooter: S.Boolean.annotations({ description: "Whether tag contains footer" }),
    isHeader: S.Boolean.annotations({ description: "Whether this is a header" }),
    readOnly: S.Boolean.annotations({ description: "Whether tag is read-only" }),
    dataType: DataType.annotations({ description: "Data type of the tag" }),
  },
  $I.annotations("ITagFlags", {
    description: "APEv2 tag flags structure",
  })
) {}

export class IFooter extends S.Class<IFooter>($I`IFooter`)(
  {
    ID: S.String.annotations({ description: "Footer identifier - should equal 'APETAGEX'" }),
    version: S.Number.annotations({ description: "APE tag version" }),
    size: S.Number.annotations({
      description: "Complete size of the tag including footer (excludes header)",
    }),
    fields: S.Number.annotations({ description: "Number of fields in the tag" }),
    flags: ITagFlags.annotations({ description: "Global tag flags of all items" }),
  },
  $I.annotations("IFooter", {
    description: "APEv2 tag footer structure",
  })
) {}

// =============================================================================
// Phase 3: Composite Classes
// =============================================================================

export class IChapter extends S.Class<IChapter>($I`IChapter`)(
  {
    title: S.String.annotations({ description: "Chapter title" }),
    sampleOffset: S.Number.annotations({
      description: "Audio offset in sample number - duration offset is sampleOffset / format.sampleRate",
    }),
    start: S.Number.annotations({
      description: "Timestamp where chapter starts - chapter timestamp is start/timeScale in seconds",
    }),
    timeScale: S.Number.annotations({
      description: "Time scale for chapter tracks - number of time units per second",
    }),
  },
  $I.annotations("IChapter", {
    description: "Chapter information for audiobook/podcast chapters",
  })
) {}

/**
 * Schema that accepts any number for TrackType and transforms to string.
 * Uses filter to validate the number is a valid TrackType value.
 */
const TrackTypeNumber = S.Number.pipe(
  S.filter((n): n is 1 | 2 | 3 | 4 | 17 | 18 | 32 => [0x01, 0x02, 0x03, 0x04, 0x11, 0x12, 0x20].includes(n), {
    message: () => "Invalid TrackType value",
  }),
  S.transform(TrackType, {
    decode: (n) => TrackTypeFromNumber.decodeMap.get(n as 1 | 2 | 3 | 4 | 17 | 18 | 32)!,
    encode: (s) => TrackTypeFromNumber.encodeMap.get(s)!,
  })
);

export class ITrackInfo extends S.Class<ITrackInfo>($I`ITrackInfo`)(
  {
    type: withNullableOption(TrackTypeNumber).annotations({
      description: "Optional track type",
    }),
    codecName: withNullableOption(S.String).annotations({
      description: "Optional codec name",
    }),
    codecSettings: withNullableOption(S.String).annotations({
      description: "Optional codec settings",
    }),
    flagEnabled: withNullableOption(S.Boolean).annotations({
      description: "Optional enabled flag",
    }),
    flagDefault: withNullableOption(S.Boolean).annotations({
      description: "Optional default track flag",
    }),
    flagLacing: withNullableOption(S.Boolean).annotations({
      description: "Optional lacing flag",
    }),
    name: withNullableOption(S.String).annotations({
      description: "Optional track name",
    }),
    language: withNullableOption(S.String).annotations({
      description: "Optional language code",
    }),
    audio: withNullableOption(IAudioTrack).annotations({
      description: "Optional audio track information",
    }),
    video: withNullableOption(IVideoTrack).annotations({
      description: "Optional video track information",
    }),
  },
  $I.annotations("ITrackInfo", {
    description: "Track metadata container for container formats",
  })
) {}

export class IFormat extends S.Class<IFormat>($I`IFormat`)(
  {
    trackInfo: S.Array(ITrackInfo).annotations({
      description: "Track information array",
    }),
    container: withNullableOption(S.String).annotations({
      description: "Optional container format, e.g. 'flac'",
    }),
    tagTypes: S.Array(TagType).annotations({
      description: "List of tags found in parsed audio file",
    }),
    duration: withNullableOption(S.Number).annotations({
      description: "Optional duration in seconds",
    }),
    bitrate: withNullableOption(S.Number).annotations({
      description: "Optional bits per second of encoded audio file",
    }),
    sampleRate: withNullableOption(S.Number).annotations({
      description: "Optional sampling rate in samples per second",
    }),
    bitsPerSample: withNullableOption(S.Number).annotations({
      description: "Optional audio bit depth",
    }),
    tool: withNullableOption(S.String).annotations({
      description: "Optional encoder brand, e.g. LAME3.99r",
    }),
    codec: withNullableOption(S.String).annotations({
      description: "Optional encoder name/compression type, e.g. 'PCM', 'ITU-T G.711 mu-law'",
    }),
    codecProfile: withNullableOption(S.String).annotations({
      description: "Optional codec profile",
    }),
    lossless: withNullableOption(S.Boolean).annotations({
      description: "Optional lossless encoding flag",
    }),
    numberOfChannels: withNullableOption(S.Number).annotations({
      description: "Optional number of audio channels",
    }),
    numberOfSamples: withNullableOption(S.Number).annotations({
      description: "Optional number of sample frames - duration is numberOfSamples / sampleRate",
    }),
    audioMD5: withNullableOption(S.Uint8ArrayFromSelf).annotations({
      description: "Optional 16-byte MD5 of raw audio",
    }),
    chapters: withNullableOption(S.Array(IChapter)).annotations({
      description: "Optional chapters in audio stream",
    }),
    creationTime: withNullableOption(DateTimeUtcFromAllAcceptable).annotations({
      description: "Optional time file was created",
    }),
    modificationTime: withNullableOption(DateTimeUtcFromAllAcceptable).annotations({
      description: "Optional time file was modified",
    }),
    trackGain: withNullableOption(S.Number).annotations({
      description: "Optional track gain",
    }),
    trackPeakLevel: withNullableOption(S.Number).annotations({
      description: "Optional track peak level",
    }),
    albumGain: withNullableOption(S.Number).annotations({
      description: "Optional album gain",
    }),
    hasAudio: withNullableOption(S.Boolean).annotations({
      description: "Optional flag indicating if file contains an audio stream",
    }),
    hasVideo: withNullableOption(S.Boolean).annotations({
      description: "Optional flag indicating if file contains a video stream",
    }),
  },
  $I.annotations("IFormat", {
    description: "Audio format information",
  })
) {}

export const INativeTags = S.Record({
  key: S.String,
  value: S.Array(ITag),
}).annotations(
  $I.annotations("INativeTags", {
    description: "Flat list of tags indexed by tag type",
  })
);

export declare namespace INativeTags {
  export type Type = S.Schema.Type<typeof INativeTags>;
  export type Encoded = S.Schema.Encoded<typeof INativeTags>;
}

export const INativeTagDict = S.Record({
  key: S.String,
  value: S.Array(S.Unknown),
}).annotations(
  $I.annotations("INativeTagDict", {
    description: "Tags ordered by tag ID",
  })
);

export declare namespace INativeTagDict {
  export type Type = S.Schema.Type<typeof INativeTagDict>;
  export type Encoded = S.Schema.Encoded<typeof INativeTagDict>;
}

export class IQualityInformation extends S.Class<IQualityInformation>($I`IQualityInformation`)(
  {
    warnings: S.Array(IParserWarning).annotations({
      description: "Parser warnings",
    }),
  },
  $I.annotations("IQualityInformation", {
    description: "Container for parsing quality information",
  })
) {}

// =============================================================================
// Phase 4: Metadata Containers
// =============================================================================

export class INativeAudioMetadata extends S.Class<INativeAudioMetadata>($I`INativeAudioMetadata`)(
  {
    format: IFormat.annotations({ description: "Audio format information" }),
    native: INativeTags.annotations({ description: "Native tags by tag type" }),
    quality: IQualityInformation.annotations({ description: "Parsing quality information" }),
  },
  $I.annotations("INativeAudioMetadata", {
    description: "Raw metadata before normalization",
  })
) {}

export class IAudioMetadata extends INativeAudioMetadata.extend<IAudioMetadata>($I`IAudioMetadata`)(
  {
    common: ICommonTagsResult.annotations({
      description: "Metadata in a format-independent interface",
    }),
  },
  $I.annotations("IAudioMetadata", {
    description: "Complete metadata structure with normalized tags",
  })
) {}

export declare namespace IAudioMetadata {
  export type Type = typeof IAudioMetadata.Type;
  export type Encoded = typeof IAudioMetadata.Encoded;
}

// =============================================================================
// Phase 5: Event System
// =============================================================================

export class IMetadataEventTag extends S.Class<IMetadataEventTag>($I`IMetadataEventTag`)(
  {
    type: MetadataEventType.annotations({
      description: "Event type - either 'common' for generic tag events or 'format' for format related updates",
    }),
    id: S.String.annotations({
      description: "Tag id (keyof ICommonTagsResult or FormatId)",
    }),
    value: S.Unknown.annotations({
      description: "Tag value - AnyTagValue is unknown",
    }),
  },
  $I.annotations("IMetadataEventTag", {
    description: "Event tag metadata for observers",
  })
) {}

export class IMetadataEvent extends S.Class<IMetadataEvent>($I`IMetadataEvent`)(
  {
    tag: IMetadataEventTag.annotations({
      description: "Tag which has been updated",
    }),
    metadata: IAudioMetadata.annotations({
      description: "Metadata model including the attached tag",
    }),
  },
  $I.annotations("IMetadataEvent", {
    description: "Event fired when metadata is updated during parsing",
  })
) {}

/**
 * Observer callback function type for metadata events.
 * Note: Effect Schema does not directly support function types,
 * so we represent this as a type alias for documentation purposes.
 * In runtime, this would be: (update: IMetadataEvent) => void
 */
export type Observer = (update: S.Schema.Type<typeof IMetadataEvent>) => void;

// =============================================================================
// Phase 6: Options
// =============================================================================

export class IOptions extends S.Class<IOptions>($I`IOptions`)(
  {
    duration: withNullableOption(S.Boolean).annotations({
      description: "If true, parse whole media file to determine duration (default: false)",
    }),
    skipCovers: withNullableOption(S.Boolean).annotations({
      description: "If true, skip parsing covers (default: false)",
    }),
    skipPostHeaders: withNullableOption(S.Boolean).annotations({
      description: "If true, skip searching entire track for additional headers (default: false)",
    }),
    includeChapters: withNullableOption(S.Boolean).annotations({
      description: "If true, include MP4 chapters (default: false)",
    }),
    mkvUseIndex: withNullableOption(S.Boolean).annotations({
      description: "If true, use SeekHead element index in Matroska files (default: false)",
    }),
  },
  $I.annotations("IOptions", {
    description: "Parser configuration options",
  })
) {}

export class IApeHeader extends IOptions.extend<IApeHeader>($I`IApeHeader`)(
  {
    offset: S.Number.annotations({ description: "Offset of APE-header in bytes" }),
    footer: IFooter.annotations({ description: "APEv1 / APEv2 footer structure" }),
  },
  $I.annotations("IApeHeader", {
    description: "APEv2 header structure with APE-specific fields",
  })
) {}

export declare namespace IApeHeader {
  export type Type = typeof IApeHeader.Type;
  export type Encoded = typeof IApeHeader.Encoded;
}

export class IPrivateOptions extends IOptions.extend<IPrivateOptions>($I`IPrivateOptions`)(
  {
    apeHeader: withNullableOption(IApeHeader).annotations({
      description: "Optional APE header for APEv2 tag processing",
    }),
  },
  $I.annotations("IPrivateOptions", {
    description: "Internal parser options with APE header support",
  })
) {}

export declare namespace IPrivateOptions {
  export type Type = typeof IPrivateOptions.Type;
  export type Encoded = typeof IPrivateOptions.Encoded;
}

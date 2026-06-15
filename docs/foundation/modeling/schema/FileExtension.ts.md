---
title: FileExtension.ts
nav_order: 83
parent: "@beep/schema"
---

## FileExtension.ts overview

Schema-backed file extension literals derived from the shared mime-type tables.

This module exposes per-category schemas for the supported mime datasets and a
combined `FileExtension` schema that accepts any known extension from
those groups.

**Example**

```ts
```typescript
import * as S from "effect/Schema";
import { FileExtension, ImageFileExtension } from "@beep/schema/FileExtension";

const png = S.decodeUnknownSync(FileExtension)("png");
const jpeg = S.decodeUnknownSync(ImageFileExtension)("jpeg");
console.log([png, jpeg]);
```
```

Since v0.0.0

---
## Exports Grouped by Category
  - [AudioFileExtension (type alias)](#audiofileextension-type-alias)
  - [FileExtension (type alias)](#fileextension-type-alias)
  - [ImageFileExtension (type alias)](#imagefileextension-type-alias)
  - [MiscFileExtension (type alias)](#miscfileextension-type-alias)
  - [TextFileExtension (type alias)](#textfileextension-type-alias)
  - [VideoFileExtension (type alias)](#videofileextension-type-alias)
- [utilities](#utilities)
  - [extractMimeExtensions](#extractmimeextensions)
- [validation](#validation)
  - [ApplicationFileExtension](#applicationfileextension)
  - [AudioFileExtension](#audiofileextension)
  - [FileExtension](#fileextension)
  - [ImageFileExtension](#imagefileextension)
  - [MiscFileExtension](#miscfileextension)
  - [TextFileExtension](#textfileextension)
  - [VideoFileExtension](#videofileextension)
---

# models

## ApplicationFileExtension (type alias)

Union of literals accepted by `ApplicationFileExtension`.

**Example**

```ts
import type { ApplicationFileExtension } from "@beep/schema/FileExtension"

const ext: ApplicationFileExtension = "pdf" as ApplicationFileExtension
```

**Signature**

```ts
type ApplicationFileExtension = typeof ApplicationFileExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L117)

Since v0.0.0

## AudioFileExtension (type alias)

Union of literals accepted by `AudioFileExtension`.

**Example**

```ts
import type { AudioFileExtension } from "@beep/schema/FileExtension"

const ext: AudioFileExtension = "mp3" as AudioFileExtension
```

**Signature**

```ts
type AudioFileExtension = typeof AudioFileExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L273)

Since v0.0.0

## FileExtension (type alias)

Union of literals accepted by `FileExtension`.

**Example**

```ts
import type { FileExtension } from "@beep/schema/FileExtension"

const ext: FileExtension = "png" as FileExtension
```

**Signature**

```ts
type FileExtension = typeof FileExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L354)

Since v0.0.0

## ImageFileExtension (type alias)

Union of literals accepted by `ImageFileExtension`.

**Example**

```ts
import type { ImageFileExtension } from "@beep/schema/FileExtension"

const ext: ImageFileExtension = "png" as ImageFileExtension
```

**Signature**

```ts
type ImageFileExtension = typeof ImageFileExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L234)

Since v0.0.0

## MiscFileExtension (type alias)

Union of literals accepted by `MiscFileExtension`.

**Example**

```ts
import type { MiscFileExtension } from "@beep/schema/FileExtension"

const ext: MiscFileExtension = "ics" as MiscFileExtension
```

**Signature**

```ts
type MiscFileExtension = typeof MiscFileExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L311)

Since v0.0.0

## TextFileExtension (type alias)

Union of literals accepted by `TextFileExtension`.

**Example**

```ts
import type { TextFileExtension } from "@beep/schema/FileExtension"

const ext: TextFileExtension = "txt" as TextFileExtension
```

**Signature**

```ts
type TextFileExtension = typeof TextFileExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L195)

Since v0.0.0

## VideoFileExtension (type alias)

Union of literals accepted by `VideoFileExtension`.

**Example**

```ts
import type { VideoFileExtension } from "@beep/schema/FileExtension"

const ext: VideoFileExtension = "mp4" as VideoFileExtension
```

**Signature**

```ts
type VideoFileExtension = typeof VideoFileExtension.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L156)

Since v0.0.0

# utilities

## extractMimeExtensions

Extracts the distinct file extensions from a mime-type dictionary.

The output preserves the encounter order from the input map while flattening
nested `extensions` arrays and removing duplicates.

**Example**

```ts
```typescript
import { extractMimeExtensions } from "@beep/schema/FileExtension";

const extensions = extractMimeExtensions({
  "text/plain": {
    source: "iana",
    extensions: ["txt"],
  },
  "text/markdown": {
    source: "iana",
    extensions: ["md", "markdown"],
  },
});

console.log(extensions); // ["txt", "md", "markdown"]
```
```

**Signature**

```ts
declare const extractMimeExtensions: <const T extends MimeTypeProperty>(mime: T) => A.NonEmptyReadonlyArray<MimeTypeExtension<T>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L68)

Since v0.0.0

# validation

## ApplicationFileExtension

Schema for file extensions associated with `application/*` mime types.

**Example**

```ts
import * as S from "effect/Schema"
import { ApplicationFileExtension } from "@beep/schema/FileExtension"

const ext = S.decodeUnknownSync(ApplicationFileExtension)("pdf")
console.log(ext) // "pdf"
```

**Signature**

```ts
declare const ApplicationFileExtension: AnnotatedSchema<LiteralKit<readonly ["data" | "rdf" | "box" | "ai" | "db" | "map" | "run" | "lockb" | "dat" | "swf" | "fla" | "eps" | "sketch" | "fig" | "xd" | "blend" | "max" | "sqlite" | "sqlite3" | "mdb" | "idx" | "pyc" | "pyo" | "class" | "jar" | "war" | "ear" | "node" | "wasm" | "rlib" | "eot" | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "odt" | "ods" | "odp" | "exe" | "dll" | "so" | "dylib" | "bin" | "o" | "a" | "obj" | "lib" | "app" | "msi" | "deb" | "rpm" | "zip" | "tar" | "gz" | "bz2" | "7z" | "rar" | "xz" | "z" | "tgz" | "iso" | "seed" | "key" | "json" | "ez" | "aw" | "atom" | "atomcat" | "atomdeleted" | "atomsvc" | "dwd" | "held" | "rsat" | "xcs" | "ccxml" | "cdfx" | "cdmia" | "cdmic" | "cdmid" | "cdmio" | "cdmiq" | "cpl" | "cu" | "mpd" | "mpp" | "davmount" | "dcm" | "dbk" | "dssc" | "xdssc" | "es" | "ecma" | "emma" | "emotionml" | "epub" | "exi" | "exp" | "fdt" | "pfr" | "geojson" | "gml" | "gpx" | "gxf" | "stk" | "ink" | "inkml" | "ipfix" | "its" | "ser" | "js" | "mjs" | "jsonml" | "jsonld" | "lgr" | "lostxml" | "hqx" | "cpt" | "mads" | "webmanifest" | "mrc" | "mrcx" | "ma" | "nb" | "mb" | "mathml" | "mbox" | "mpf" | "mscml" | "metalink" | "meta4" | "mets" | "maei" | "musd" | "mods" | "m21" | "mp21" | "mp4s" | "m4p" | "dot" | "mxf" | "nq" | "nt" | "cjs" | "dms" | "lrf" | "mar" | "dist" | "distz" | "pkg" | "bpk" | "dump" | "elc" | "deploy" | "dmg" | "img" | "msp" | "msm" | "buffer" | "oda" | "opf" | "ogx" | "omdoc" | "onetoc" | "onetoc2" | "onetmp" | "onepkg" | "oxps" | "relo" | "xer" | "pgp" | "asc" | "sig" | "prf" | "p10" | "p7m" | "p7c" | "p7s" | "p8" | "ac" | "cer" | "crl" | "pkipath" | "pki" | "pls" | "ps" | "provx" | "cww" | "pskcxml" | "owl" | "rif" | "rnc" | "rl" | "rld" | "rs" | "rapd" | "sls" | "rusd" | "gbr" | "mft" | "roa" | "rsd" | "rss" | "rtf" | "sbml" | "scq" | "scs" | "spq" | "spp" | "sdp" | "senmlx" | "sensmlx" | "setpay" | "setreg" | "shf" | "siv" | "sieve" | "smi" | "smil" | "rq" | "srx" | "gram" | "grxml" | "sru" | "ssdl" | "ssml" | "swidtag" | "tei" | "teicorpus" | "tfi" | "tsd" | "trig" | "ttml" | "rsheet" | "td" | "1km" | "plb" | "psb" | "pvb" | "tcap" | "pwn" | "aso" | "imp" | "acu" | "atc" | "acutc" | "air" | "fcdt" | "fxp" | "fxpl" | "xdp" | "xfdf" | "age" | "ahead" | "azf" | "azs" | "azw" | "acc" | "ami" | "apk" | "cii" | "fti" | "atx" | "mpkg" | "m3u8" | "numbers" | "pages" | "swi" | "iota" | "aep" | "bmml" | "mpm" | "bmi" | "rep" | "cdxml" | "mmd" | "cdy" | "csl" | "cla" | "rp9" | "c4g" | "c4d" | "c4f" | "c4p" | "c4u" | "c11amc" | "c11amz" | "csp" | "cdbcmsg" | "cmc" | "clkx" | "clkk" | "clkp" | "clkt" | "clkw" | "wbs" | "pml" | "ppd" | "car" | "pcurl" | "dart" | "rdz" | "dbf" | "uvf" | "uvvf" | "uvd" | "uvvd" | "uvt" | "uvvt" | "uvx" | "uvvx" | "uvz" | "uvvz" | "fe_launch" | "dna" | "mlp" | "dpg" | "dfac" | "kpxx" | "ait" | "svc" | "geo" | "mag" | "nml" | "esf" | "msf" | "qam" | "slt" | "ssf" | "es3" | "et3" | "ez2" | "ez3" | "fdf" | "mseed" | "dataless" | "gph" | "ftc" | "fm" | "frame" | "maker" | "book" | "fnc" | "ltf" | "fsc" | "oas" | "oa2" | "oa3" | "fg5" | "bh2" | "ddd" | "xdw" | "xbd" | "fzs" | "txd" | "ggb" | "ggt" | "gex" | "gre" | "gxt" | "g2w" | "g3w" | "gmx" | "kml" | "kmz" | "gqf" | "gqs" | "gac" | "ghf" | "gim" | "grv" | "gtm" | "tpl" | "vcg" | "hal" | "zmm" | "hbci" | "les" | "hpgl" | "hpid" | "hps" | "jlt" | "pcl" | "pclxl" | "sfd-hdstx" | "mpy" | "afp" | "listafp" | "list3820" | "irm" | "sc" | "icc" | "icm" | "igl" | "ivp" | "ivu" | "igm" | "xpw" | "xpx" | "i2g" | "qbo" | "qfx" | "rcprofile" | "irp" | "xpr" | "fcs" | "jam" | "rms" | "jisp" | "joda" | "ktz" | "ktr" | "karbon" | "chrt" | "kfo" | "flw" | "kon" | "kpr" | "kpt" | "ksp" | "kwd" | "kwt" | "htke" | "kia" | "kne" | "knp" | "skp" | "skd" | "skt" | "skm" | "sse" | "lasxml" | "lbd" | "lbe" | "123" | "apr" | "pre" | "nsf" | "org" | "scm" | "lwp" | "portpkg" | "mvt" | "mcd" | "mc1" | "cdkey" | "mwf" | "mfm" | "flo" | "igx" | "mif" | "daf" | "dis" | "mbk" | "mqy" | "msl" | "plc" | "txf" | "mpn" | "mpc" | "xul" | "cil" | "cab" | "xlm" | "xla" | "xlc" | "xlt" | "xlw" | "xlam" | "xlsb" | "xlsm" | "xltm" | "chm" | "ims" | "lrm" | "thmx" | "cat" | "stl" | "pps" | "pot" | "ppam" | "pptm" | "sldm" | "ppsm" | "potm" | "mpt" | "docm" | "dotm" | "wps" | "wks" | "wcm" | "wdb" | "wpl" | "xps" | "mseq" | "mus" | "msty" | "taglet" | "nlu" | "ntf" | "nitf" | "nnd" | "nns" | "nnw" | "ngdat" | "n-gage" | "rpst" | "rpss" | "edm" | "edx" | "ext" | "odc" | "otc" | "odb" | "odf" | "odft" | "odg" | "otg" | "odi" | "oti" | "otp" | "ots" | "odm" | "ott" | "oth" | "xo" | "dd2" | "obgx" | "oxt" | "osm" | "sldx" | "ppsx" | "potx" | "xltx" | "dotx" | "mgp" | "dp" | "esa" | "pdb" | "pqa" | "oprc" | "paw" | "str" | "ei6" | "efif" | "wg" | "plf" | "pbd" | "mgz" | "qps" | "ptid" | "qxd" | "qxt" | "qwd" | "qwt" | "qxl" | "qxb" | "bed" | "mxl" | "musicxml" | "cryptonote" | "cod" | "rm" | "rmvb" | "link66" | "st" | "see" | "sema" | "semd" | "semf" | "ifm" | "itp" | "iif" | "ipk" | "twd" | "twds" | "mmf" | "teacher" | "fo" | "sdkm" | "sdkd" | "dxp" | "sfs" | "sdc" | "sda" | "sdd" | "smf" | "sdw" | "vor" | "sgl" | "smzip" | "sm" | "wadl" | "sxc" | "stc" | "sxd" | "std" | "sxi" | "sti" | "sxm" | "sxw" | "sxg" | "stw" | "sus" | "susp" | "svd" | "sis" | "sisx" | "xsm" | "bdm" | "xdm" | "ddf" | "tao" | "pcap" | "cap" | "dmp" | "tmo" | "tpt" | "mxs" | "tra" | "ufd" | "ufdl" | "utz" | "umj" | "unityweb" | "uoml" | "vcx" | "vsd" | "vst" | "vss" | "vsw" | "vis" | "vsf" | "wbxml" | "wmlc" | "wmlsc" | "wtb" | "nbp" | "wpd" | "wqd" | "stf" | "xar" | "xfdl" | "hvd" | "hvs" | "hvp" | "osf" | "osfpvg" | "saf" | "spf" | "cmp" | "zir" | "zirz" | "zaz" | "vxml" | "wif" | "wgt" | "hlp" | "wsdl" | "wspolicy" | "abw" | "ace" | "aab" | "x32" | "u32" | "vox" | "aam" | "aas" | "bcpio" | "torrent" | "blb" | "blorb" | "bz" | "boz" | "cbr" | "cba" | "cbt" | "cbz" | "cb7" | "vcd" | "cfs" | "chat" | "pgn" | "cco" | "nsc" | "cpio" | "csh" | "udeb" | "dgc" | "dir" | "dcr" | "dxr" | "cst" | "cct" | "cxt" | "w3d" | "fgd" | "swa" | "wad" | "ncx" | "dtb" | "res" | "dvi" | "evy" | "eva" | "bdf" | "gsf" | "psf" | "pcf" | "snf" | "pfa" | "pfb" | "pfm" | "afm" | "arc" | "spl" | "gca" | "ulx" | "gnumeric" | "gramps" | "gtar" | "hdf" | "install" | "jardiff" | "jnlp" | "latex" | "lzh" | "lha" | "mie" | "prc" | "mobi" | "application" | "lnk" | "wmd" | "wmz" | "xbap" | "obd" | "crd" | "clp" | "com" | "bat" | "mvb" | "m13" | "m14" | "wmf" | "emf" | "emz" | "mny" | "pub" | "scd" | "trm" | "wri" | "nc" | "cdf" | "nzb" | "pl" | "pm" | "p12" | "pfx" | "p7b" | "spc" | "p7r" | "ris" | "sea" | "sh" | "shar" | "xap" | "sql" | "sit" | "sitx" | "srt" | "sv4cpio" | "sv4crc" | "t3" | "gam" | "tcl" | "tk" | "tex" | "tfm" | "texinfo" | "texi" | "ustar" | "src" | "der" | "crt" | "pem" | "xlf" | "xpi" | "z1" | "z2" | "z3" | "z4" | "z5" | "z6" | "z7" | "z8" | "xaml" | "xav" | "xca" | "xdf" | "xel" | "xns" | "xenc" | "xhtml" | "xht" | "xml" | "xsl" | "xsd" | "rng" | "dtd" | "xop" | "xpl" | "xslt" | "xspf" | "mxml" | "xhvml" | "xvml" | "xvm" | "yaml" | "yml" | "yang" | "yin", ...("data" | "rdf" | "box" | "ai" | "db" | "map" | "run" | "lockb" | "dat" | "swf" | "fla" | "eps" | "sketch" | "fig" | "xd" | "blend" | "max" | "sqlite" | "sqlite3" | "mdb" | "idx" | "pyc" | "pyo" | "class" | "jar" | "war" | "ear" | "node" | "wasm" | "rlib" | "eot" | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "odt" | "ods" | "odp" | "exe" | "dll" | "so" | "dylib" | "bin" | "o" | "a" | "obj" | "lib" | "app" | "msi" | "deb" | "rpm" | "zip" | "tar" | "gz" | "bz2" | "7z" | "rar" | "xz" | "z" | "tgz" | "iso" | "seed" | "key" | "json" | "ez" | "aw" | "atom" | "atomcat" | "atomdeleted" | "atomsvc" | "dwd" | "held" | "rsat" | "xcs" | "ccxml" | "cdfx" | "cdmia" | "cdmic" | "cdmid" | "cdmio" | "cdmiq" | "cpl" | "cu" | "mpd" | "mpp" | "davmount" | "dcm" | "dbk" | "dssc" | "xdssc" | "es" | "ecma" | "emma" | "emotionml" | "epub" | "exi" | "exp" | "fdt" | "pfr" | "geojson" | "gml" | "gpx" | "gxf" | "stk" | "ink" | "inkml" | "ipfix" | "its" | "ser" | "js" | "mjs" | "jsonml" | "jsonld" | "lgr" | "lostxml" | "hqx" | "cpt" | "mads" | "webmanifest" | "mrc" | "mrcx" | "ma" | "nb" | "mb" | "mathml" | "mbox" | "mpf" | "mscml" | "metalink" | "meta4" | "mets" | "maei" | "musd" | "mods" | "m21" | "mp21" | "mp4s" | "m4p" | "dot" | "mxf" | "nq" | "nt" | "cjs" | "dms" | "lrf" | "mar" | "dist" | "distz" | "pkg" | "bpk" | "dump" | "elc" | "deploy" | "dmg" | "img" | "msp" | "msm" | "buffer" | "oda" | "opf" | "ogx" | "omdoc" | "onetoc" | "onetoc2" | "onetmp" | "onepkg" | "oxps" | "relo" | "xer" | "pgp" | "asc" | "sig" | "prf" | "p10" | "p7m" | "p7c" | "p7s" | "p8" | "ac" | "cer" | "crl" | "pkipath" | "pki" | "pls" | "ps" | "provx" | "cww" | "pskcxml" | "owl" | "rif" | "rnc" | "rl" | "rld" | "rs" | "rapd" | "sls" | "rusd" | "gbr" | "mft" | "roa" | "rsd" | "rss" | "rtf" | "sbml" | "scq" | "scs" | "spq" | "spp" | "sdp" | "senmlx" | "sensmlx" | "setpay" | "setreg" | "shf" | "siv" | "sieve" | "smi" | "smil" | "rq" | "srx" | "gram" | "grxml" | "sru" | "ssdl" | "ssml" | "swidtag" | "tei" | "teicorpus" | "tfi" | "tsd" | "trig" | "ttml" | "rsheet" | "td" | "1km" | "plb" | "psb" | "pvb" | "tcap" | "pwn" | "aso" | "imp" | "acu" | "atc" | "acutc" | "air" | "fcdt" | "fxp" | "fxpl" | "xdp" | "xfdf" | "age" | "ahead" | "azf" | "azs" | "azw" | "acc" | "ami" | "apk" | "cii" | "fti" | "atx" | "mpkg" | "m3u8" | "numbers" | "pages" | "swi" | "iota" | "aep" | "bmml" | "mpm" | "bmi" | "rep" | "cdxml" | "mmd" | "cdy" | "csl" | "cla" | "rp9" | "c4g" | "c4d" | "c4f" | "c4p" | "c4u" | "c11amc" | "c11amz" | "csp" | "cdbcmsg" | "cmc" | "clkx" | "clkk" | "clkp" | "clkt" | "clkw" | "wbs" | "pml" | "ppd" | "car" | "pcurl" | "dart" | "rdz" | "dbf" | "uvf" | "uvvf" | "uvd" | "uvvd" | "uvt" | "uvvt" | "uvx" | "uvvx" | "uvz" | "uvvz" | "fe_launch" | "dna" | "mlp" | "dpg" | "dfac" | "kpxx" | "ait" | "svc" | "geo" | "mag" | "nml" | "esf" | "msf" | "qam" | "slt" | "ssf" | "es3" | "et3" | "ez2" | "ez3" | "fdf" | "mseed" | "dataless" | "gph" | "ftc" | "fm" | "frame" | "maker" | "book" | "fnc" | "ltf" | "fsc" | "oas" | "oa2" | "oa3" | "fg5" | "bh2" | "ddd" | "xdw" | "xbd" | "fzs" | "txd" | "ggb" | "ggt" | "gex" | "gre" | "gxt" | "g2w" | "g3w" | "gmx" | "kml" | "kmz" | "gqf" | "gqs" | "gac" | "ghf" | "gim" | "grv" | "gtm" | "tpl" | "vcg" | "hal" | "zmm" | "hbci" | "les" | "hpgl" | "hpid" | "hps" | "jlt" | "pcl" | "pclxl" | "sfd-hdstx" | "mpy" | "afp" | "listafp" | "list3820" | "irm" | "sc" | "icc" | "icm" | "igl" | "ivp" | "ivu" | "igm" | "xpw" | "xpx" | "i2g" | "qbo" | "qfx" | "rcprofile" | "irp" | "xpr" | "fcs" | "jam" | "rms" | "jisp" | "joda" | "ktz" | "ktr" | "karbon" | "chrt" | "kfo" | "flw" | "kon" | "kpr" | "kpt" | "ksp" | "kwd" | "kwt" | "htke" | "kia" | "kne" | "knp" | "skp" | "skd" | "skt" | "skm" | "sse" | "lasxml" | "lbd" | "lbe" | "123" | "apr" | "pre" | "nsf" | "org" | "scm" | "lwp" | "portpkg" | "mvt" | "mcd" | "mc1" | "cdkey" | "mwf" | "mfm" | "flo" | "igx" | "mif" | "daf" | "dis" | "mbk" | "mqy" | "msl" | "plc" | "txf" | "mpn" | "mpc" | "xul" | "cil" | "cab" | "xlm" | "xla" | "xlc" | "xlt" | "xlw" | "xlam" | "xlsb" | "xlsm" | "xltm" | "chm" | "ims" | "lrm" | "thmx" | "cat" | "stl" | "pps" | "pot" | "ppam" | "pptm" | "sldm" | "ppsm" | "potm" | "mpt" | "docm" | "dotm" | "wps" | "wks" | "wcm" | "wdb" | "wpl" | "xps" | "mseq" | "mus" | "msty" | "taglet" | "nlu" | "ntf" | "nitf" | "nnd" | "nns" | "nnw" | "ngdat" | "n-gage" | "rpst" | "rpss" | "edm" | "edx" | "ext" | "odc" | "otc" | "odb" | "odf" | "odft" | "odg" | "otg" | "odi" | "oti" | "otp" | "ots" | "odm" | "ott" | "oth" | "xo" | "dd2" | "obgx" | "oxt" | "osm" | "sldx" | "ppsx" | "potx" | "xltx" | "dotx" | "mgp" | "dp" | "esa" | "pdb" | "pqa" | "oprc" | "paw" | "str" | "ei6" | "efif" | "wg" | "plf" | "pbd" | "mgz" | "qps" | "ptid" | "qxd" | "qxt" | "qwd" | "qwt" | "qxl" | "qxb" | "bed" | "mxl" | "musicxml" | "cryptonote" | "cod" | "rm" | "rmvb" | "link66" | "st" | "see" | "sema" | "semd" | "semf" | "ifm" | "itp" | "iif" | "ipk" | "twd" | "twds" | "mmf" | "teacher" | "fo" | "sdkm" | "sdkd" | "dxp" | "sfs" | "sdc" | "sda" | "sdd" | "smf" | "sdw" | "vor" | "sgl" | "smzip" | "sm" | "wadl" | "sxc" | "stc" | "sxd" | "std" | "sxi" | "sti" | "sxm" | "sxw" | "sxg" | "stw" | "sus" | "susp" | "svd" | "sis" | "sisx" | "xsm" | "bdm" | "xdm" | "ddf" | "tao" | "pcap" | "cap" | "dmp" | "tmo" | "tpt" | "mxs" | "tra" | "ufd" | "ufdl" | "utz" | "umj" | "unityweb" | "uoml" | "vcx" | "vsd" | "vst" | "vss" | "vsw" | "vis" | "vsf" | "wbxml" | "wmlc" | "wmlsc" | "wtb" | "nbp" | "wpd" | "wqd" | "stf" | "xar" | "xfdl" | "hvd" | "hvs" | "hvp" | "osf" | "osfpvg" | "saf" | "spf" | "cmp" | "zir" | "zirz" | "zaz" | "vxml" | "wif" | "wgt" | "hlp" | "wsdl" | "wspolicy" | "abw" | "ace" | "aab" | "x32" | "u32" | "vox" | "aam" | "aas" | "bcpio" | "torrent" | "blb" | "blorb" | "bz" | "boz" | "cbr" | "cba" | "cbt" | "cbz" | "cb7" | "vcd" | "cfs" | "chat" | "pgn" | "cco" | "nsc" | "cpio" | "csh" | "udeb" | "dgc" | "dir" | "dcr" | "dxr" | "cst" | "cct" | "cxt" | "w3d" | "fgd" | "swa" | "wad" | "ncx" | "dtb" | "res" | "dvi" | "evy" | "eva" | "bdf" | "gsf" | "psf" | "pcf" | "snf" | "pfa" | "pfb" | "pfm" | "afm" | "arc" | "spl" | "gca" | "ulx" | "gnumeric" | "gramps" | "gtar" | "hdf" | "install" | "jardiff" | "jnlp" | "latex" | "lzh" | "lha" | "mie" | "prc" | "mobi" | "application" | "lnk" | "wmd" | "wmz" | "xbap" | "obd" | "crd" | "clp" | "com" | "bat" | "mvb" | "m13" | "m14" | "wmf" | "emf" | "emz" | "mny" | "pub" | "scd" | "trm" | "wri" | "nc" | "cdf" | "nzb" | "pl" | "pm" | "p12" | "pfx" | "p7b" | "spc" | "p7r" | "ris" | "sea" | "sh" | "shar" | "xap" | "sql" | "sit" | "sitx" | "srt" | "sv4cpio" | "sv4crc" | "t3" | "gam" | "tcl" | "tk" | "tex" | "tfm" | "texinfo" | "texi" | "ustar" | "src" | "der" | "crt" | "pem" | "xlf" | "xpi" | "z1" | "z2" | "z3" | "z4" | "z5" | "z6" | "z7" | "z8" | "xaml" | "xav" | "xca" | "xdf" | "xel" | "xns" | "xenc" | "xhtml" | "xht" | "xml" | "xsl" | "xsd" | "rng" | "dtd" | "xop" | "xpl" | "xslt" | "xspf" | "mxml" | "xhvml" | "xvml" | "xvm" | "yaml" | "yml" | "yang" | "yin")[]], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L95)

Since v0.0.0

## AudioFileExtension

Schema for file extensions associated with `audio/*` mime types.

**Example**

```ts
import * as S from "effect/Schema"
import { AudioFileExtension } from "@beep/schema/FileExtension"

const ext = S.decodeUnknownSync(AudioFileExtension)("mp3")
console.log(ext) // "mp3"
```

**Signature**

```ts
declare const AudioFileExtension: AnnotatedSchema<LiteralKit<readonly ["mp3" | "wav" | "ogg" | "flac" | "aac" | "m4a" | "wma" | "aiff" | "opus" | "3gpp" | "adp" | "amr" | "au" | "snd" | "mid" | "midi" | "kar" | "rmi" | "mxmf" | "mp4a" | "mpga" | "mp2" | "mp2a" | "m2a" | "m3a" | "oga" | "spx" | "s3m" | "sil" | "uva" | "uvva" | "eol" | "dra" | "dts" | "dtshd" | "lvp" | "pya" | "ecelp4800" | "ecelp7470" | "ecelp9600" | "rip" | "weba" | "aif" | "aifc" | "caf" | "mka" | "m3u" | "wax" | "ram" | "ra" | "rmp" | "gsm" | "xm", ...("mp3" | "wav" | "ogg" | "flac" | "aac" | "m4a" | "wma" | "aiff" | "opus" | "3gpp" | "adp" | "amr" | "au" | "snd" | "mid" | "midi" | "kar" | "rmi" | "mxmf" | "mp4a" | "mpga" | "mp2" | "mp2a" | "m2a" | "m3a" | "oga" | "spx" | "s3m" | "sil" | "uva" | "uvva" | "eol" | "dra" | "dts" | "dtshd" | "lvp" | "pya" | "ecelp4800" | "ecelp7470" | "ecelp9600" | "rip" | "weba" | "aif" | "aifc" | "caf" | "mka" | "m3u" | "wax" | "ram" | "ra" | "rmp" | "gsm" | "xm")[]], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L251)

Since v0.0.0

## FileExtension

Schema for any supported file extension across all mime-type categories.

**Example**

```ts
import * as S from "effect/Schema"
import { FileExtension } from "@beep/schema/FileExtension"

const ext = S.decodeUnknownSync(FileExtension)("json")
console.log(ext) // "json"
```

**Signature**

```ts
declare const FileExtension: AnnotatedSchema<LiteralKit<readonly ["data" | "rdf" | "box" | "ai" | "db" | "map" | "run" | "lockb" | "dat" | "swf" | "fla" | "eps" | "sketch" | "fig" | "xd" | "blend" | "max" | "sqlite" | "sqlite3" | "mdb" | "idx" | "pyc" | "pyo" | "class" | "jar" | "war" | "ear" | "node" | "wasm" | "rlib" | "eot" | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "odt" | "ods" | "odp" | "exe" | "dll" | "so" | "dylib" | "bin" | "o" | "a" | "obj" | "lib" | "app" | "msi" | "deb" | "rpm" | "zip" | "tar" | "gz" | "bz2" | "7z" | "rar" | "xz" | "z" | "tgz" | "iso" | "seed" | "key" | "json" | "ez" | "aw" | "atom" | "atomcat" | "atomdeleted" | "atomsvc" | "dwd" | "held" | "rsat" | "xcs" | "ccxml" | "cdfx" | "cdmia" | "cdmic" | "cdmid" | "cdmio" | "cdmiq" | "cpl" | "cu" | "mpd" | "mpp" | "davmount" | "dcm" | "dbk" | "dssc" | "xdssc" | "es" | "ecma" | "emma" | "emotionml" | "epub" | "exi" | "exp" | "fdt" | "pfr" | "geojson" | "gml" | "gpx" | "gxf" | "stk" | "ink" | "inkml" | "ipfix" | "its" | "ser" | "js" | "mjs" | "jsonml" | "jsonld" | "lgr" | "lostxml" | "hqx" | "cpt" | "mads" | "webmanifest" | "mrc" | "mrcx" | "ma" | "nb" | "mb" | "mathml" | "mbox" | "mpf" | "mscml" | "metalink" | "meta4" | "mets" | "maei" | "musd" | "mods" | "m21" | "mp21" | "mp4s" | "m4p" | "dot" | "mxf" | "nq" | "nt" | "cjs" | "dms" | "lrf" | "mar" | "dist" | "distz" | "pkg" | "bpk" | "dump" | "elc" | "deploy" | "dmg" | "img" | "msp" | "msm" | "buffer" | "oda" | "opf" | "ogx" | "omdoc" | "onetoc" | "onetoc2" | "onetmp" | "onepkg" | "oxps" | "relo" | "xer" | "pgp" | "asc" | "sig" | "prf" | "p10" | "p7m" | "p7c" | "p7s" | "p8" | "ac" | "cer" | "crl" | "pkipath" | "pki" | "pls" | "ps" | "provx" | "cww" | "pskcxml" | "owl" | "rif" | "rnc" | "rl" | "rld" | "rs" | "rapd" | "sls" | "rusd" | "gbr" | "mft" | "roa" | "rsd" | "rss" | "rtf" | "sbml" | "scq" | "scs" | "spq" | "spp" | "sdp" | "senmlx" | "sensmlx" | "setpay" | "setreg" | "shf" | "siv" | "sieve" | "smi" | "smil" | "rq" | "srx" | "gram" | "grxml" | "sru" | "ssdl" | "ssml" | "swidtag" | "tei" | "teicorpus" | "tfi" | "tsd" | "trig" | "ttml" | "rsheet" | "td" | "1km" | "plb" | "psb" | "pvb" | "tcap" | "pwn" | "aso" | "imp" | "acu" | "atc" | "acutc" | "air" | "fcdt" | "fxp" | "fxpl" | "xdp" | "xfdf" | "age" | "ahead" | "azf" | "azs" | "azw" | "acc" | "ami" | "apk" | "cii" | "fti" | "atx" | "mpkg" | "m3u8" | "numbers" | "pages" | "swi" | "iota" | "aep" | "bmml" | "mpm" | "bmi" | "rep" | "cdxml" | "mmd" | "cdy" | "csl" | "cla" | "rp9" | "c4g" | "c4d" | "c4f" | "c4p" | "c4u" | "c11amc" | "c11amz" | "csp" | "cdbcmsg" | "cmc" | "clkx" | "clkk" | "clkp" | "clkt" | "clkw" | "wbs" | "pml" | "ppd" | "car" | "pcurl" | "dart" | "rdz" | "dbf" | "uvf" | "uvvf" | "uvd" | "uvvd" | "uvt" | "uvvt" | "uvx" | "uvvx" | "uvz" | "uvvz" | "fe_launch" | "dna" | "mlp" | "dpg" | "dfac" | "kpxx" | "ait" | "svc" | "geo" | "mag" | "nml" | "esf" | "msf" | "qam" | "slt" | "ssf" | "es3" | "et3" | "ez2" | "ez3" | "fdf" | "mseed" | "dataless" | "gph" | "ftc" | "fm" | "frame" | "maker" | "book" | "fnc" | "ltf" | "fsc" | "oas" | "oa2" | "oa3" | "fg5" | "bh2" | "ddd" | "xdw" | "xbd" | "fzs" | "txd" | "ggb" | "ggt" | "gex" | "gre" | "gxt" | "g2w" | "g3w" | "gmx" | "kml" | "kmz" | "gqf" | "gqs" | "gac" | "ghf" | "gim" | "grv" | "gtm" | "tpl" | "vcg" | "hal" | "zmm" | "hbci" | "les" | "hpgl" | "hpid" | "hps" | "jlt" | "pcl" | "pclxl" | "sfd-hdstx" | "mpy" | "afp" | "listafp" | "list3820" | "irm" | "sc" | "icc" | "icm" | "igl" | "ivp" | "ivu" | "igm" | "xpw" | "xpx" | "i2g" | "qbo" | "qfx" | "rcprofile" | "irp" | "xpr" | "fcs" | "jam" | "rms" | "jisp" | "joda" | "ktz" | "ktr" | "karbon" | "chrt" | "kfo" | "flw" | "kon" | "kpr" | "kpt" | "ksp" | "kwd" | "kwt" | "htke" | "kia" | "kne" | "knp" | "skp" | "skd" | "skt" | "skm" | "sse" | "lasxml" | "lbd" | "lbe" | "123" | "apr" | "pre" | "nsf" | "org" | "scm" | "lwp" | "portpkg" | "mvt" | "mcd" | "mc1" | "cdkey" | "mwf" | "mfm" | "flo" | "igx" | "mif" | "daf" | "dis" | "mbk" | "mqy" | "msl" | "plc" | "txf" | "mpn" | "mpc" | "xul" | "cil" | "cab" | "xlm" | "xla" | "xlc" | "xlt" | "xlw" | "xlam" | "xlsb" | "xlsm" | "xltm" | "chm" | "ims" | "lrm" | "thmx" | "cat" | "stl" | "pps" | "pot" | "ppam" | "pptm" | "sldm" | "ppsm" | "potm" | "mpt" | "docm" | "dotm" | "wps" | "wks" | "wcm" | "wdb" | "wpl" | "xps" | "mseq" | "mus" | "msty" | "taglet" | "nlu" | "ntf" | "nitf" | "nnd" | "nns" | "nnw" | "ngdat" | "n-gage" | "rpst" | "rpss" | "edm" | "edx" | "ext" | "odc" | "otc" | "odb" | "odf" | "odft" | "odg" | "otg" | "odi" | "oti" | "otp" | "ots" | "odm" | "ott" | "oth" | "xo" | "dd2" | "obgx" | "oxt" | "osm" | "sldx" | "ppsx" | "potx" | "xltx" | "dotx" | "mgp" | "dp" | "esa" | "pdb" | "pqa" | "oprc" | "paw" | "str" | "ei6" | "efif" | "wg" | "plf" | "pbd" | "mgz" | "qps" | "ptid" | "qxd" | "qxt" | "qwd" | "qwt" | "qxl" | "qxb" | "bed" | "mxl" | "musicxml" | "cryptonote" | "cod" | "rm" | "rmvb" | "link66" | "st" | "see" | "sema" | "semd" | "semf" | "ifm" | "itp" | "iif" | "ipk" | "twd" | "twds" | "mmf" | "teacher" | "fo" | "sdkm" | "sdkd" | "dxp" | "sfs" | "sdc" | "sda" | "sdd" | "smf" | "sdw" | "vor" | "sgl" | "smzip" | "sm" | "wadl" | "sxc" | "stc" | "sxd" | "std" | "sxi" | "sti" | "sxm" | "sxw" | "sxg" | "stw" | "sus" | "susp" | "svd" | "sis" | "sisx" | "xsm" | "bdm" | "xdm" | "ddf" | "tao" | "pcap" | "cap" | "dmp" | "tmo" | "tpt" | "mxs" | "tra" | "ufd" | "ufdl" | "utz" | "umj" | "unityweb" | "uoml" | "vcx" | "vsd" | "vst" | "vss" | "vsw" | "vis" | "vsf" | "wbxml" | "wmlc" | "wmlsc" | "wtb" | "nbp" | "wpd" | "wqd" | "stf" | "xar" | "xfdl" | "hvd" | "hvs" | "hvp" | "osf" | "osfpvg" | "saf" | "spf" | "cmp" | "zir" | "zirz" | "zaz" | "vxml" | "wif" | "wgt" | "hlp" | "wsdl" | "wspolicy" | "abw" | "ace" | "aab" | "x32" | "u32" | "vox" | "aam" | "aas" | "bcpio" | "torrent" | "blb" | "blorb" | "bz" | "boz" | "cbr" | "cba" | "cbt" | "cbz" | "cb7" | "vcd" | "cfs" | "chat" | "pgn" | "cco" | "nsc" | "cpio" | "csh" | "udeb" | "dgc" | "dir" | "dcr" | "dxr" | "cst" | "cct" | "cxt" | "w3d" | "fgd" | "swa" | "wad" | "ncx" | "dtb" | "res" | "dvi" | "evy" | "eva" | "bdf" | "gsf" | "psf" | "pcf" | "snf" | "pfa" | "pfb" | "pfm" | "afm" | "arc" | "spl" | "gca" | "ulx" | "gnumeric" | "gramps" | "gtar" | "hdf" | "install" | "jardiff" | "jnlp" | "latex" | "lzh" | "lha" | "mie" | "prc" | "mobi" | "application" | "lnk" | "wmd" | "wmz" | "xbap" | "obd" | "crd" | "clp" | "com" | "bat" | "mvb" | "m13" | "m14" | "wmf" | "emf" | "emz" | "mny" | "pub" | "scd" | "trm" | "wri" | "nc" | "cdf" | "nzb" | "pl" | "pm" | "p12" | "pfx" | "p7b" | "spc" | "p7r" | "ris" | "sea" | "sh" | "shar" | "xap" | "sql" | "sit" | "sitx" | "srt" | "sv4cpio" | "sv4crc" | "t3" | "gam" | "tcl" | "tk" | "tex" | "tfm" | "texinfo" | "texi" | "ustar" | "src" | "der" | "crt" | "pem" | "xlf" | "xpi" | "z1" | "z2" | "z3" | "z4" | "z5" | "z6" | "z7" | "z8" | "xaml" | "xav" | "xca" | "xdf" | "xel" | "xns" | "xenc" | "xhtml" | "xht" | "xml" | "xsl" | "xsd" | "rng" | "dtd" | "xop" | "xpl" | "xslt" | "xspf" | "mxml" | "xhvml" | "xvml" | "xvm" | "yaml" | "yml" | "yang" | "yin", ...("data" | "md" | "rdf" | "box" | "ai" | "db" | "map" | "run" | "lockb" | "dat" | "swf" | "fla" | "psd" | "eps" | "sketch" | "fig" | "xd" | "blend" | "3ds" | "max" | "sqlite" | "sqlite3" | "mdb" | "idx" | "pyc" | "pyo" | "class" | "jar" | "war" | "ear" | "node" | "wasm" | "rlib" | "ttf" | "otf" | "woff" | "woff2" | "eot" | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "odt" | "ods" | "odp" | "exe" | "dll" | "so" | "dylib" | "bin" | "o" | "a" | "obj" | "lib" | "app" | "msi" | "deb" | "rpm" | "zip" | "tar" | "gz" | "bz2" | "7z" | "rar" | "xz" | "z" | "tgz" | "iso" | "mp3" | "wav" | "ogg" | "flac" | "aac" | "m4a" | "wma" | "aiff" | "opus" | "mp4" | "mov" | "avi" | "mkv" | "webm" | "wmv" | "flv" | "m4v" | "mpeg" | "mpg" | "png" | "jpg" | "jpeg" | "gif" | "bmp" | "ico" | "webp" | "tiff" | "tif" | "sub" | "seed" | "c" | "h" | "key" | "text" | "json" | "ez" | "aw" | "atom" | "atomcat" | "atomdeleted" | "atomsvc" | "dwd" | "held" | "rsat" | "xcs" | "ccxml" | "cdfx" | "cdmia" | "cdmic" | "cdmid" | "cdmio" | "cdmiq" | "cpl" | "cu" | "mpd" | "mpp" | "davmount" | "dcm" | "dbk" | "dssc" | "xdssc" | "es" | "ecma" | "emma" | "emotionml" | "epub" | "exi" | "exp" | "fdt" | "pfr" | "geojson" | "gml" | "gpx" | "gxf" | "stk" | "ink" | "inkml" | "ipfix" | "its" | "ser" | "js" | "mjs" | "jsonml" | "jsonld" | "lgr" | "lostxml" | "hqx" | "cpt" | "mads" | "webmanifest" | "mrc" | "mrcx" | "ma" | "nb" | "mb" | "mathml" | "mbox" | "mpf" | "mscml" | "metalink" | "meta4" | "mets" | "maei" | "musd" | "mods" | "m21" | "mp21" | "mp4s" | "m4p" | "dot" | "mxf" | "nq" | "nt" | "cjs" | "dms" | "lrf" | "mar" | "dist" | "distz" | "pkg" | "bpk" | "dump" | "elc" | "deploy" | "dmg" | "img" | "msp" | "msm" | "buffer" | "oda" | "opf" | "ogx" | "omdoc" | "onetoc" | "onetoc2" | "onetmp" | "onepkg" | "oxps" | "relo" | "xer" | "pgp" | "asc" | "sig" | "prf" | "p10" | "p7m" | "p7c" | "p7s" | "p8" | "ac" | "cer" | "crl" | "pkipath" | "pki" | "pls" | "ps" | "provx" | "cww" | "pskcxml" | "owl" | "rif" | "rnc" | "rl" | "rld" | "rs" | "rapd" | "sls" | "rusd" | "gbr" | "mft" | "roa" | "rsd" | "rss" | "rtf" | "sbml" | "scq" | "scs" | "spq" | "spp" | "sdp" | "senmlx" | "sensmlx" | "setpay" | "setreg" | "shf" | "siv" | "sieve" | "smi" | "smil" | "rq" | "srx" | "gram" | "grxml" | "sru" | "ssdl" | "ssml" | "swidtag" | "tei" | "teicorpus" | "tfi" | "tsd" | "trig" | "ttml" | "rsheet" | "td" | "1km" | "plb" | "psb" | "pvb" | "tcap" | "pwn" | "aso" | "imp" | "acu" | "atc" | "acutc" | "air" | "fcdt" | "fxp" | "fxpl" | "xdp" | "xfdf" | "age" | "ahead" | "azf" | "azs" | "azw" | "acc" | "ami" | "apk" | "cii" | "fti" | "atx" | "mpkg" | "m3u8" | "numbers" | "pages" | "swi" | "iota" | "aep" | "bmml" | "mpm" | "bmi" | "rep" | "cdxml" | "mmd" | "cdy" | "csl" | "cla" | "rp9" | "c4g" | "c4d" | "c4f" | "c4p" | "c4u" | "c11amc" | "c11amz" | "csp" | "cdbcmsg" | "cmc" | "clkx" | "clkk" | "clkp" | "clkt" | "clkw" | "wbs" | "pml" | "ppd" | "car" | "pcurl" | "dart" | "rdz" | "dbf" | "uvf" | "uvvf" | "uvd" | "uvvd" | "uvt" | "uvvt" | "uvx" | "uvvx" | "uvz" | "uvvz" | "fe_launch" | "dna" | "mlp" | "dpg" | "dfac" | "kpxx" | "ait" | "svc" | "geo" | "mag" | "nml" | "esf" | "msf" | "qam" | "slt" | "ssf" | "es3" | "et3" | "ez2" | "ez3" | "fdf" | "mseed" | "dataless" | "gph" | "ftc" | "fm" | "frame" | "maker" | "book" | "fnc" | "ltf" | "fsc" | "oas" | "oa2" | "oa3" | "fg5" | "bh2" | "ddd" | "xdw" | "xbd" | "fzs" | "txd" | "ggb" | "ggt" | "gex" | "gre" | "gxt" | "g2w" | "g3w" | "gmx" | "kml" | "kmz" | "gqf" | "gqs" | "gac" | "ghf" | "gim" | "grv" | "gtm" | "tpl" | "vcg" | "hal" | "zmm" | "hbci" | "les" | "hpgl" | "hpid" | "hps" | "jlt" | "pcl" | "pclxl" | "sfd-hdstx" | "mpy" | "afp" | "listafp" | "list3820" | "irm" | "sc" | "icc" | "icm" | "igl" | "ivp" | "ivu" | "igm" | "xpw" | "xpx" | "i2g" | "qbo" | "qfx" | "rcprofile" | "irp" | "xpr" | "fcs" | "jam" | "rms" | "jisp" | "joda" | "ktz" | "ktr" | "karbon" | "chrt" | "kfo" | "flw" | "kon" | "kpr" | "kpt" | "ksp" | "kwd" | "kwt" | "htke" | "kia" | "kne" | "knp" | "skp" | "skd" | "skt" | "skm" | "sse" | "lasxml" | "lbd" | "lbe" | "123" | "apr" | "pre" | "nsf" | "org" | "scm" | "lwp" | "portpkg" | "mvt" | "mcd" | "mc1" | "cdkey" | "mwf" | "mfm" | "flo" | "igx" | "mif" | "daf" | "dis" | "mbk" | "mqy" | "msl" | "plc" | "txf" | "mpn" | "mpc" | "xul" | "cil" | "cab" | "xlm" | "xla" | "xlc" | "xlt" | "xlw" | "xlam" | "xlsb" | "xlsm" | "xltm" | "chm" | "ims" | "lrm" | "thmx" | "cat" | "stl" | "pps" | "pot" | "ppam" | "pptm" | "sldm" | "ppsm" | "potm" | "mpt" | "docm" | "dotm" | "wps" | "wks" | "wcm" | "wdb" | "wpl" | "xps" | "mseq" | "mus" | "msty" | "taglet" | "nlu" | "ntf" | "nitf" | "nnd" | "nns" | "nnw" | "ngdat" | "n-gage" | "rpst" | "rpss" | "edm" | "edx" | "ext" | "odc" | "otc" | "odb" | "odf" | "odft" | "odg" | "otg" | "odi" | "oti" | "otp" | "ots" | "odm" | "ott" | "oth" | "xo" | "dd2" | "obgx" | "oxt" | "osm" | "sldx" | "ppsx" | "potx" | "xltx" | "dotx" | "mgp" | "dp" | "esa" | "pdb" | "pqa" | "oprc" | "paw" | "str" | "ei6" | "efif" | "wg" | "plf" | "pbd" | "mgz" | "qps" | "ptid" | "qxd" | "qxt" | "qwd" | "qwt" | "qxl" | "qxb" | "bed" | "mxl" | "musicxml" | "cryptonote" | "cod" | "rm" | "rmvb" | "link66" | "st" | "see" | "sema" | "semd" | "semf" | "ifm" | "itp" | "iif" | "ipk" | "twd" | "twds" | "mmf" | "teacher" | "fo" | "sdkm" | "sdkd" | "dxp" | "sfs" | "sdc" | "sda" | "sdd" | "smf" | "sdw" | "vor" | "sgl" | "smzip" | "sm" | "wadl" | "sxc" | "stc" | "sxd" | "std" | "sxi" | "sti" | "sxm" | "sxw" | "sxg" | "stw" | "sus" | "susp" | "svd" | "sis" | "sisx" | "xsm" | "bdm" | "xdm" | "ddf" | "tao" | "pcap" | "cap" | "dmp" | "tmo" | "tpt" | "mxs" | "tra" | "ufd" | "ufdl" | "utz" | "umj" | "unityweb" | "uoml" | "vcx" | "vsd" | "vst" | "vss" | "vsw" | "vis" | "vsf" | "wbxml" | "wmlc" | "wmlsc" | "wtb" | "nbp" | "wpd" | "wqd" | "stf" | "xar" | "xfdl" | "hvd" | "hvs" | "hvp" | "osf" | "osfpvg" | "saf" | "spf" | "cmp" | "zir" | "zirz" | "zaz" | "vxml" | "wif" | "wgt" | "hlp" | "wsdl" | "wspolicy" | "abw" | "ace" | "aab" | "x32" | "u32" | "vox" | "aam" | "aas" | "bcpio" | "torrent" | "blb" | "blorb" | "bz" | "boz" | "cbr" | "cba" | "cbt" | "cbz" | "cb7" | "vcd" | "cfs" | "chat" | "pgn" | "cco" | "nsc" | "cpio" | "csh" | "udeb" | "dgc" | "dir" | "dcr" | "dxr" | "cst" | "cct" | "cxt" | "w3d" | "fgd" | "swa" | "wad" | "ncx" | "dtb" | "res" | "dvi" | "evy" | "eva" | "bdf" | "gsf" | "psf" | "pcf" | "snf" | "pfa" | "pfb" | "pfm" | "afm" | "arc" | "spl" | "gca" | "ulx" | "gnumeric" | "gramps" | "gtar" | "hdf" | "install" | "jardiff" | "jnlp" | "latex" | "lzh" | "lha" | "mie" | "prc" | "mobi" | "application" | "lnk" | "wmd" | "wmz" | "xbap" | "obd" | "crd" | "clp" | "com" | "bat" | "mvb" | "m13" | "m14" | "wmf" | "emf" | "emz" | "mny" | "pub" | "scd" | "trm" | "wri" | "nc" | "cdf" | "nzb" | "pl" | "pm" | "p12" | "pfx" | "p7b" | "spc" | "p7r" | "ris" | "sea" | "sh" | "shar" | "xap" | "sql" | "sit" | "sitx" | "srt" | "sv4cpio" | "sv4crc" | "t3" | "gam" | "tcl" | "tk" | "tex" | "tfm" | "texinfo" | "texi" | "ustar" | "src" | "der" | "crt" | "pem" | "xlf" | "xpi" | "z1" | "z2" | "z3" | "z4" | "z5" | "z6" | "z7" | "z8" | "xaml" | "xav" | "xca" | "xdf" | "xel" | "xns" | "xenc" | "xhtml" | "xht" | "xml" | "xsl" | "xsd" | "rng" | "dtd" | "xop" | "xpl" | "xslt" | "xspf" | "mxml" | "xhvml" | "xvml" | "xvm" | "yaml" | "yml" | "yang" | "yin" | "3gp" | "3gpp" | "3g2" | "h261" | "h263" | "h264" | "m4s" | "jpgv" | "jpm" | "jpgm" | "mj2" | "mjp2" | "ts" | "mp4v" | "mpg4" | "mpe" | "m1v" | "m2v" | "ogv" | "qt" | "uvh" | "uvvh" | "uvm" | "uvvm" | "uvp" | "uvvp" | "uvs" | "uvvs" | "uvv" | "uvvv" | "dvb" | "fvt" | "mxu" | "m4u" | "pyv" | "uvu" | "uvvu" | "viv" | "f4v" | "fli" | "mk3d" | "mks" | "mng" | "asf" | "asx" | "vob" | "wm" | "wmx" | "wvx" | "movie" | "smv" | "appcache" | "manifest" | "ics" | "ifb" | "css" | "csv" | "html" | "htm" | "shtml" | "markdown" | "mml" | "n3" | "txt" | "conf" | "def" | "list" | "log" | "in" | "ini" | "dsc" | "rtx" | "sgml" | "sgm" | "shex" | "spdx" | "tsv" | "t" | "tr" | "roff" | "man" | "me" | "ms" | "ttl" | "uri" | "uris" | "urls" | "vcard" | "curl" | "dcurl" | "mcurl" | "scurl" | "ged" | "fly" | "flx" | "gv" | "3dml" | "spot" | "jad" | "wml" | "wmls" | "vtt" | "s" | "asm" | "cc" | "cxx" | "cpp" | "hh" | "dic" | "htc" | "f" | "for" | "f77" | "f90" | "java" | "nfo" | "opml" | "p" | "pas" | "etx" | "sfv" | "uu" | "vcs" | "vcf" | "exr" | "avci" | "avcs" | "avif" | "cgm" | "drle" | "fits" | "g3" | "heic" | "heics" | "heif" | "heifs" | "hej2" | "hsj2" | "ief" | "jls" | "jp2" | "jpg2" | "jpe" | "jfif" | "pjpeg" | "pjp" | "jph" | "jhc" | "jpx" | "jpf" | "jxr" | "jxra" | "jxrs" | "jxs" | "jxsc" | "jxsi" | "jxss" | "ktx" | "ktx2" | "btif" | "pti" | "sgi" | "svg" | "svgz" | "t38" | "tfx" | "azv" | "uvi" | "uvvi" | "uvg" | "uvvg" | "djvu" | "djv" | "dwg" | "dxf" | "fbs" | "fpx" | "fst" | "mmr" | "rlc" | "mdi" | "wdp" | "npx" | "b16" | "tap" | "vtf" | "wbmp" | "xif" | "pcx" | "ras" | "cmx" | "fh" | "fhc" | "fh4" | "fh5" | "fh7" | "jng" | "sid" | "pic" | "pct" | "pnm" | "pbm" | "pgm" | "ppm" | "rgb" | "tga" | "xbm" | "xpm" | "xwd" | "adp" | "amr" | "au" | "snd" | "mid" | "midi" | "kar" | "rmi" | "mxmf" | "mp4a" | "mpga" | "mp2" | "mp2a" | "m2a" | "m3a" | "oga" | "spx" | "s3m" | "sil" | "uva" | "uvva" | "eol" | "dra" | "dts" | "dtshd" | "lvp" | "pya" | "ecelp4800" | "ecelp7470" | "ecelp9600" | "rip" | "weba" | "aif" | "aifc" | "caf" | "mka" | "m3u" | "wax" | "ram" | "ra" | "rmp" | "gsm" | "xm" | "cdx" | "cif" | "cmdf" | "cml" | "csml" | "xyz" | "ttc" | "disposition-notification" | "u8msg" | "u8dsn" | "u8mdn" | "u8hdr" | "eml" | "mime" | "wsc" | "3mf" | "gltf" | "glb" | "igs" | "iges" | "msh" | "mesh" | "silo" | "mtl" | ".p21" | ".stp" | ".step" | ".stpnc" | ".210" | "stpx" | "stpz" | "stpxz" | "dae" | "dwf" | "gdl" | "gtw" | "mts" | "ogex" | "x_b" | "x_t" | "vds" | "usdz" | "bsp" | "vtu" | "wrl" | "vrml" | "x3db" | "x3dbz" | "x3dv" | "x3dvz" | "x3d" | "x3dz" | "ice")[]], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L328)

Since v0.0.0

## ImageFileExtension

Schema for file extensions associated with `image/*` mime types.

**Example**

```ts
import * as S from "effect/Schema"
import { ImageFileExtension } from "@beep/schema/FileExtension"

const ext = S.decodeUnknownSync(ImageFileExtension)("png")
console.log(ext) // "png"
```

**Signature**

```ts
declare const ImageFileExtension: AnnotatedSchema<LiteralKit<readonly ["psd" | "3ds" | "png" | "jpg" | "jpeg" | "gif" | "bmp" | "ico" | "webp" | "tiff" | "tif" | "sub" | "wmf" | "emf" | "jpm" | "exr" | "avci" | "avcs" | "avif" | "cgm" | "drle" | "fits" | "g3" | "heic" | "heics" | "heif" | "heifs" | "hej2" | "hsj2" | "ief" | "jls" | "jp2" | "jpg2" | "jpe" | "jfif" | "pjpeg" | "pjp" | "jph" | "jhc" | "jpx" | "jpf" | "jxr" | "jxra" | "jxrs" | "jxs" | "jxsc" | "jxsi" | "jxss" | "ktx" | "ktx2" | "btif" | "pti" | "sgi" | "svg" | "svgz" | "t38" | "tfx" | "azv" | "uvi" | "uvvi" | "uvg" | "uvvg" | "djvu" | "djv" | "dwg" | "dxf" | "fbs" | "fpx" | "fst" | "mmr" | "rlc" | "mdi" | "wdp" | "npx" | "b16" | "tap" | "vtf" | "wbmp" | "xif" | "pcx" | "ras" | "cmx" | "fh" | "fhc" | "fh4" | "fh5" | "fh7" | "jng" | "sid" | "pic" | "pct" | "pnm" | "pbm" | "pgm" | "ppm" | "rgb" | "tga" | "xbm" | "xpm" | "xwd", ...("psd" | "3ds" | "png" | "jpg" | "jpeg" | "gif" | "bmp" | "ico" | "webp" | "tiff" | "tif" | "sub" | "wmf" | "emf" | "jpm" | "exr" | "avci" | "avcs" | "avif" | "cgm" | "drle" | "fits" | "g3" | "heic" | "heics" | "heif" | "heifs" | "hej2" | "hsj2" | "ief" | "jls" | "jp2" | "jpg2" | "jpe" | "jfif" | "pjpeg" | "pjp" | "jph" | "jhc" | "jpx" | "jpf" | "jxr" | "jxra" | "jxrs" | "jxs" | "jxsc" | "jxsi" | "jxss" | "ktx" | "ktx2" | "btif" | "pti" | "sgi" | "svg" | "svgz" | "t38" | "tfx" | "azv" | "uvi" | "uvvi" | "uvg" | "uvvg" | "djvu" | "djv" | "dwg" | "dxf" | "fbs" | "fpx" | "fst" | "mmr" | "rlc" | "mdi" | "wdp" | "npx" | "b16" | "tap" | "vtf" | "wbmp" | "xif" | "pcx" | "ras" | "cmx" | "fh" | "fhc" | "fh4" | "fh5" | "fh7" | "jng" | "sid" | "pic" | "pct" | "pnm" | "pbm" | "pgm" | "ppm" | "rgb" | "tga" | "xbm" | "xpm" | "xwd")[]], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L212)

Since v0.0.0

## MiscFileExtension

Schema for file extensions associated with miscellaneous mime types.

**Example**

```ts
import * as S from "effect/Schema"
import { MiscFileExtension } from "@beep/schema/FileExtension"

const decode = S.decodeUnknownSync(MiscFileExtension)
```

**Signature**

```ts
declare const MiscFileExtension: AnnotatedSchema<LiteralKit<readonly ["ttf" | "otf" | "woff" | "woff2" | "obj" | "stl" | "cdx" | "cif" | "cmdf" | "cml" | "csml" | "xyz" | "ttc" | "disposition-notification" | "u8msg" | "u8dsn" | "u8mdn" | "u8hdr" | "eml" | "mime" | "wsc" | "3mf" | "gltf" | "glb" | "igs" | "iges" | "msh" | "mesh" | "silo" | "mtl" | ".p21" | ".stp" | ".step" | ".stpnc" | ".210" | "stpx" | "stpz" | "stpxz" | "dae" | "dwf" | "gdl" | "gtw" | "mts" | "ogex" | "x_b" | "x_t" | "vds" | "usdz" | "bsp" | "vtu" | "wrl" | "vrml" | "x3db" | "x3dbz" | "x3dv" | "x3dvz" | "x3d" | "x3dz" | "ice", ...("ttf" | "otf" | "woff" | "woff2" | "obj" | "stl" | "cdx" | "cif" | "cmdf" | "cml" | "csml" | "xyz" | "ttc" | "disposition-notification" | "u8msg" | "u8dsn" | "u8mdn" | "u8hdr" | "eml" | "mime" | "wsc" | "3mf" | "gltf" | "glb" | "igs" | "iges" | "msh" | "mesh" | "silo" | "mtl" | ".p21" | ".stp" | ".step" | ".stpnc" | ".210" | "stpx" | "stpz" | "stpxz" | "dae" | "dwf" | "gdl" | "gtw" | "mts" | "ogex" | "x_b" | "x_t" | "vds" | "usdz" | "bsp" | "vtu" | "wrl" | "vrml" | "x3db" | "x3dbz" | "x3dv" | "x3dvz" | "x3d" | "x3dz" | "ice")[]], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L289)

Since v0.0.0

## TextFileExtension

Schema for file extensions associated with `text/*` mime types.

**Example**

```ts
import * as S from "effect/Schema"
import { TextFileExtension } from "@beep/schema/FileExtension"

const ext = S.decodeUnknownSync(TextFileExtension)("txt")
console.log(ext) // "txt"
```

**Signature**

```ts
declare const TextFileExtension: AnnotatedSchema<LiteralKit<readonly ["md" | "sub" | "c" | "h" | "text" | "rtf" | "xml" | "appcache" | "manifest" | "ics" | "ifb" | "css" | "csv" | "html" | "htm" | "shtml" | "markdown" | "mml" | "n3" | "txt" | "conf" | "def" | "list" | "log" | "in" | "ini" | "dsc" | "rtx" | "sgml" | "sgm" | "shex" | "spdx" | "tsv" | "t" | "tr" | "roff" | "man" | "me" | "ms" | "ttl" | "uri" | "uris" | "urls" | "vcard" | "curl" | "dcurl" | "mcurl" | "scurl" | "ged" | "fly" | "flx" | "gv" | "3dml" | "spot" | "jad" | "wml" | "wmls" | "vtt" | "s" | "asm" | "cc" | "cxx" | "cpp" | "hh" | "dic" | "htc" | "f" | "for" | "f77" | "f90" | "java" | "nfo" | "opml" | "p" | "pas" | "etx" | "sfv" | "uu" | "vcs" | "vcf", ...("md" | "sub" | "c" | "h" | "text" | "rtf" | "xml" | "appcache" | "manifest" | "ics" | "ifb" | "css" | "csv" | "html" | "htm" | "shtml" | "markdown" | "mml" | "n3" | "txt" | "conf" | "def" | "list" | "log" | "in" | "ini" | "dsc" | "rtx" | "sgml" | "sgm" | "shex" | "spdx" | "tsv" | "t" | "tr" | "roff" | "man" | "me" | "ms" | "ttl" | "uri" | "uris" | "urls" | "vcard" | "curl" | "dcurl" | "mcurl" | "scurl" | "ged" | "fly" | "flx" | "gv" | "3dml" | "spot" | "jad" | "wml" | "wmls" | "vtt" | "s" | "asm" | "cc" | "cxx" | "cpp" | "hh" | "dic" | "htc" | "f" | "for" | "f77" | "f90" | "java" | "nfo" | "opml" | "p" | "pas" | "etx" | "sfv" | "uu" | "vcs" | "vcf")[]], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L173)

Since v0.0.0

## VideoFileExtension

Schema for file extensions associated with `video/*` mime types.

**Example**

```ts
import * as S from "effect/Schema"
import { VideoFileExtension } from "@beep/schema/FileExtension"

const ext = S.decodeUnknownSync(VideoFileExtension)("mp4")
console.log(ext) // "mp4"
```

**Signature**

```ts
declare const VideoFileExtension: AnnotatedSchema<LiteralKit<readonly ["mp4" | "mov" | "avi" | "mkv" | "webm" | "wmv" | "flv" | "m4v" | "mpeg" | "mpg" | "3gp" | "3gpp" | "3g2" | "h261" | "h263" | "h264" | "m4s" | "jpgv" | "jpm" | "jpgm" | "mj2" | "mjp2" | "ts" | "mp4v" | "mpg4" | "mpe" | "m1v" | "m2v" | "ogv" | "qt" | "uvh" | "uvvh" | "uvm" | "uvvm" | "uvp" | "uvvp" | "uvs" | "uvvs" | "uvv" | "uvvv" | "dvb" | "fvt" | "mxu" | "m4u" | "pyv" | "uvu" | "uvvu" | "viv" | "f4v" | "fli" | "mk3d" | "mks" | "mng" | "asf" | "asx" | "vob" | "wm" | "wmx" | "wvx" | "movie" | "smv", ...("mp4" | "mov" | "avi" | "mkv" | "webm" | "wmv" | "flv" | "m4v" | "mpeg" | "mpg" | "3gp" | "3gpp" | "3g2" | "h261" | "h263" | "h264" | "m4s" | "jpgv" | "jpm" | "jpgm" | "mj2" | "mjp2" | "ts" | "mp4v" | "mpg4" | "mpe" | "m1v" | "m2v" | "ogv" | "qt" | "uvh" | "uvvh" | "uvm" | "uvvm" | "uvp" | "uvvp" | "uvs" | "uvvs" | "uvv" | "uvvv" | "dvb" | "fvt" | "mxu" | "m4u" | "pyv" | "uvu" | "uvvu" | "viv" | "f4v" | "fli" | "mk3d" | "mks" | "mng" | "asf" | "asx" | "vob" | "wm" | "wmx" | "wvx" | "movie" | "smv")[]], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FileExtension.ts#L134)

Since v0.0.0
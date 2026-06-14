---
title: MimeType.ts
nav_order: 149
parent: "@beep/schema"
---

## MimeType.ts overview

MIME type literal schemas derived from bundled MIME metadata.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ApplicationMimeType (type alias)](#applicationmimetype-type-alias)
  - [AudioMimeType (type alias)](#audiomimetype-type-alias)
  - [ImageMimeType (type alias)](#imagemimetype-type-alias)
  - [MimeType (type alias)](#mimetype-type-alias)
  - [MiscMimeType (type alias)](#miscmimetype-type-alias)
  - [TextMimeType (type alias)](#textmimetype-type-alias)
  - [VideoMimeType (type alias)](#videomimetype-type-alias)
- [schemas](#schemas)
  - [ApplicationMimeType](#applicationmimetype)
  - [AudioMimeType](#audiomimetype)
  - [ImageMimeType](#imagemimetype)
  - [MimeType](#mimetype)
  - [MiscMimeType](#miscmimetype)
  - [TextMimeType](#textmimetype)
  - [VideoMimeType](#videomimetype)
- [utilities](#utilities)
  - [extractMimeTypes](#extractmimetypes)
---

# models

## ApplicationMimeType (type alias)

Union of application mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { ApplicationMimeType } from "@beep/schema/MimeType"
import type { ApplicationMimeType as ApplicationMimeTypeValue } from "@beep/schema/MimeType"

const program = Effect.gen(function* () {
  const contentType: ApplicationMimeTypeValue =
    yield* S.decodeUnknownEffect(ApplicationMimeType)("application/json")
  return contentType
})

Effect.runPromise(program)
```

**Signature**

```ts
type ApplicationMimeType = typeof MimeType.kinds.Application.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L192)

Since v0.0.0

## AudioMimeType (type alias)

Union of audio mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { AudioMimeType } from "@beep/schema/MimeType"
import type { AudioMimeType as AudioMimeTypeValue } from "@beep/schema/MimeType"

const program = Effect.gen(function* () {
  const mimeType: AudioMimeTypeValue = yield* S.decodeUnknownEffect(AudioMimeType)("audio/mpeg")
  return mimeType
})

Effect.runPromise(program)
```

**Signature**

```ts
type AudioMimeType = typeof MimeType.kinds.Audio.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L360)

Since v0.0.0

## ImageMimeType (type alias)

Union of image mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { ImageMimeType } from "@beep/schema/MimeType"
import type { ImageMimeType as ImageMimeTypeValue } from "@beep/schema/MimeType"

const program = Effect.gen(function* () {
  const mimeType: ImageMimeTypeValue = yield* S.decodeUnknownEffect(ImageMimeType)("image/png")
  return mimeType
})

Effect.runPromise(program)
```

**Signature**

```ts
type ImageMimeType = typeof MimeType.kinds.Image.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L318)

Since v0.0.0

## MimeType (type alias)

Union of supported mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { MimeType } from "@beep/schema/MimeType"
import type { MimeType as MimeTypeValue } from "@beep/schema/MimeType"

const program = Effect.gen(function* () {
  const contentType: MimeTypeValue = yield* S.decodeUnknownEffect(MimeType)("application/json")
  return contentType
})

Effect.runPromise(program)
```

**Signature**

```ts
type MimeType = MimeTypesData.MimeType
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L149)

Since v0.0.0

## MiscMimeType (type alias)

Union of miscellaneous mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { MiscMimeType } from "@beep/schema/MimeType"
import type { MiscMimeType as MiscMimeTypeValue } from "@beep/schema/MimeType"

const program = Effect.gen(function* () {
  const mimeType: MiscMimeTypeValue = yield* S.decodeUnknownEffect(MiscMimeType)("font/woff2")
  return mimeType
})

Effect.runPromise(program)
```

**Signature**

```ts
type MiscMimeType = typeof MimeType.kinds.Misc.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L402)

Since v0.0.0

## TextMimeType (type alias)

Union of text mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { TextMimeType } from "@beep/schema/MimeType"
import type { TextMimeType as TextMimeTypeValue } from "@beep/schema/MimeType"

const program = Effect.gen(function* () {
  const mimeType: TextMimeTypeValue = yield* S.decodeUnknownEffect(TextMimeType)("text/plain")
  return mimeType
})

Effect.runPromise(program)
```

**Signature**

```ts
type TextMimeType = typeof MimeType.kinds.Text.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L276)

Since v0.0.0

## VideoMimeType (type alias)

Union of video mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { VideoMimeType } from "@beep/schema/MimeType"
import type { VideoMimeType as VideoMimeTypeValue } from "@beep/schema/MimeType"

const program = Effect.gen(function* () {
  const mimeType: VideoMimeTypeValue = yield* S.decodeUnknownEffect(VideoMimeType)("video/mp4")
  return mimeType
})

Effect.runPromise(program)
```

**Signature**

```ts
type VideoMimeType = typeof MimeType.kinds.Video.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L234)

Since v0.0.0

# schemas

## ApplicationMimeType

Schema for `application/*` mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { ApplicationMimeType } from "@beep/schema/MimeType"

const program = S.decodeUnknownEffect(ApplicationMimeType)("application/pdf")

Effect.runPromise(program)
```

**Signature**

```ts
declare const ApplicationMimeType: LiteralKit<readonly ["application/andrew-inset" | "application/applixware" | "application/atom+xml" | "application/atomcat+xml" | "application/atomdeleted+xml" | "application/atomsvc+xml" | "application/atsc-dwd+xml" | "application/atsc-held+xml" | "application/atsc-rsat+xml" | "application/calendar+xml" | "application/ccxml+xml" | "application/cdfx+xml" | "application/cdmi-capability" | "application/cdmi-container" | "application/cdmi-domain" | "application/cdmi-object" | "application/cdmi-queue" | "application/cpl+xml" | "application/cu-seeme" | "application/dash+xml" | "application/dash-patch+xml" | "application/davmount+xml" | "application/dicom" | "application/docbook+xml" | "application/dssc+der" | "application/dssc+xml" | "application/ecmascript" | "application/emma+xml" | "application/emotionml+xml" | "application/epub+zip" | "application/exi" | "application/express" | "application/fdt+xml" | "application/font-tdpfr" | "application/geo+json" | "application/gml+xml" | "application/gpx+xml" | "application/gxf" | "application/gzip" | "application/hyperstudio" | "application/inkml+xml" | "application/ipfix" | "application/its+xml" | "application/java-archive" | "application/java-serialized-object" | "application/java-vm" | "application/javascript" | "application/json" | "application/jsonml+json" | "application/ld+json" | "application/lgr+xml" | "application/lost+xml" | "application/mac-binhex40" | "application/mac-compactpro" | "application/mads+xml" | "application/manifest+json" | "application/marc" | "application/marcxml+xml" | "application/mathematica" | "application/mathml+xml" | "application/mbox" | "application/media-policy-dataset+xml" | "application/mediaservercontrol+xml" | "application/metalink+xml" | "application/metalink4+xml" | "application/mets+xml" | "application/mmt-aei+xml" | "application/mmt-usd+xml" | "application/mods+xml" | "application/mp21" | "application/mp4" | "application/msword" | "application/mxf" | "application/n-quads" | "application/n-triples" | "application/node" | "application/octet-stream" | "application/oda" | "application/oebps-package+xml" | "application/ogg" | "application/omdoc+xml" | "application/onenote" | "application/oxps" | "application/p2p-overlay+xml" | "application/patch-ops-error+xml" | "application/pdf" | "application/pgp-encrypted" | "application/pgp-keys" | "application/pgp-signature" | "application/pics-rules" | "application/pkcs10" | "application/pkcs7-mime" | "application/pkcs7-signature" | "application/pkcs8" | "application/pkix-attr-cert" | "application/pkix-cert" | "application/pkix-crl" | "application/pkix-pkipath" | "application/pkixcmp" | "application/pls+xml" | "application/postscript" | "application/provenance+xml" | "application/prs.cww" | "application/pskc+xml" | "application/rdf+xml" | "application/reginfo+xml" | "application/relax-ng-compact-syntax" | "application/resource-lists+xml" | "application/resource-lists-diff+xml" | "application/rls-services+xml" | "application/route-apd+xml" | "application/route-s-tsid+xml" | "application/route-usd+xml" | "application/rpki-ghostbusters" | "application/rpki-manifest" | "application/rpki-roa" | "application/rsd+xml" | "application/rss+xml" | "application/rtf" | "application/sbml+xml" | "application/scvp-cv-request" | "application/scvp-cv-response" | "application/scvp-vp-request" | "application/scvp-vp-response" | "application/sdp" | "application/senml+xml" | "application/sensml+xml" | "application/set-payment-initiation" | "application/set-registration-initiation" | "application/shf+xml" | "application/sieve" | "application/smil+xml" | "application/sparql-query" | "application/sparql-results+xml" | "application/srgs" | "application/srgs+xml" | "application/sru+xml" | "application/ssdl+xml" | "application/ssml+xml" | "application/swid+xml" | "application/tei+xml" | "application/thraud+xml" | "application/timestamped-data" | "application/trig" | "application/ttml+xml" | "application/urc-ressheet+xml" | "application/urc-targetdesc+xml" | "application/vnd.1000minds.decision-model+xml" | "application/vnd.3gpp.pic-bw-large" | "application/vnd.3gpp.pic-bw-small" | "application/vnd.3gpp.pic-bw-var" | "application/vnd.3gpp2.tcap" | "application/vnd.3m.post-it-notes" | "application/vnd.accpac.simply.aso" | "application/vnd.accpac.simply.imp" | "application/vnd.acucobol" | "application/vnd.acucorp" | "application/vnd.adobe.air-application-installer-package+zip" | "application/vnd.adobe.formscentral.fcdt" | "application/vnd.adobe.fxp" | "application/vnd.adobe.xdp+xml" | "application/vnd.adobe.xfdf" | "application/vnd.age" | "application/vnd.ahead.space" | "application/vnd.airzip.filesecure.azf" | "application/vnd.airzip.filesecure.azs" | "application/vnd.amazon.ebook" | "application/vnd.americandynamics.acc" | "application/vnd.amiga.ami" | "application/vnd.android.package-archive" | "application/vnd.anser-web-certificate-issue-initiation" | "application/vnd.anser-web-funds-transfer-initiation" | "application/vnd.antix.game-component" | "application/vnd.apple.installer+xml" | "application/vnd.apple.keynote" | "application/vnd.apple.mpegurl" | "application/vnd.apple.numbers" | "application/vnd.apple.pages" | "application/vnd.aristanetworks.swi" | "application/vnd.astraea-software.iota" | "application/vnd.audiograph" | "application/vnd.balsamiq.bmml+xml" | "application/vnd.blueice.multipass" | "application/vnd.bmi" | "application/vnd.businessobjects" | "application/vnd.chemdraw+xml" | "application/vnd.chipnuts.karaoke-mmd" | "application/vnd.cinderella" | "application/vnd.citationstyles.style+xml" | "application/vnd.claymore" | "application/vnd.cloanto.rp9" | "application/vnd.clonk.c4group" | "application/vnd.cluetrust.cartomobile-config" | "application/vnd.cluetrust.cartomobile-config-pkg" | "application/vnd.commonspace" | "application/vnd.contact.cmsg" | "application/vnd.cosmocaller" | "application/vnd.crick.clicker" | "application/vnd.crick.clicker.keyboard" | "application/vnd.crick.clicker.palette" | "application/vnd.crick.clicker.template" | "application/vnd.crick.clicker.wordbank" | "application/vnd.criticaltools.wbs+xml" | "application/vnd.ctc-posml" | "application/vnd.cups-ppd" | "application/vnd.curl.car" | "application/vnd.curl.pcurl" | "application/vnd.dart" | "application/vnd.data-vision.rdz" | "application/vnd.dbf" | "application/vnd.dece.data" | "application/vnd.dece.ttml+xml" | "application/vnd.dece.unspecified" | "application/vnd.dece.zip" | "application/vnd.denovo.fcselayout-link" | "application/vnd.dna" | "application/vnd.dolby.mlp" | "application/vnd.dpgraph" | "application/vnd.dreamfactory" | "application/vnd.dtg.local.flash" | "application/vnd.ds-keypoint" | "application/vnd.dvb.ait" | "application/vnd.dvb.service" | "application/vnd.dynageo" | "application/vnd.ecowin.chart" | "application/vnd.enliven" | "application/vnd.epson.esf" | "application/vnd.epson.msf" | "application/vnd.epson.quickanime" | "application/vnd.epson.salt" | "application/vnd.epson.ssf" | "application/vnd.eszigno3+xml" | "application/vnd.ezpix-album" | "application/vnd.ezpix-package" | "application/vnd.fdf" | "application/vnd.fdsn.mseed" | "application/vnd.fdsn.seed" | "application/vnd.flographit" | "application/vnd.fluxtime.clip" | "application/vnd.framemaker" | "application/vnd.frogans.fnc" | "application/vnd.frogans.ltf" | "application/vnd.fsc.weblaunch" | "application/vnd.fujitsu.oasys" | "application/vnd.fujitsu.oasys2" | "application/vnd.fujitsu.oasys3" | "application/vnd.fujitsu.oasysgp" | "application/vnd.fujitsu.oasysprs" | "application/vnd.fujixerox.ddd" | "application/vnd.fujixerox.docuworks" | "application/vnd.fujixerox.docuworks.binder" | "application/vnd.fuzzysheet" | "application/vnd.genomatix.tuxedo" | "application/vnd.geogebra.file" | "application/vnd.geogebra.tool" | "application/vnd.geometry-explorer" | "application/vnd.geonext" | "application/vnd.geoplan" | "application/vnd.geospace" | "application/vnd.gmx" | "application/vnd.google-earth.kml+xml" | "application/vnd.google-earth.kmz" | "application/vnd.grafeq" | "application/vnd.groove-account" | "application/vnd.groove-help" | "application/vnd.groove-identity-message" | "application/vnd.groove-injector" | "application/vnd.groove-tool-message" | "application/vnd.groove-tool-template" | "application/vnd.groove-vcard" | "application/vnd.hal+xml" | "application/vnd.handheld-entertainment+xml" | "application/vnd.hbci" | "application/vnd.hhe.lesson-player" | "application/vnd.hp-hpgl" | "application/vnd.hp-hpid" | "application/vnd.hp-hps" | "application/vnd.hp-jlyt" | "application/vnd.hp-pcl" | "application/vnd.hp-pclxl" | "application/vnd.hydrostatix.sof-data" | "application/vnd.ibm.minipay" | "application/vnd.ibm.modcap" | "application/vnd.ibm.rights-management" | "application/vnd.ibm.secure-container" | "application/vnd.iccprofile" | "application/vnd.igloader" | "application/vnd.immervision-ivp" | "application/vnd.immervision-ivu" | "application/vnd.insors.igm" | "application/vnd.intercon.formnet" | "application/vnd.intergeo" | "application/vnd.intu.qbo" | "application/vnd.intu.qfx" | "application/vnd.ipunplugged.rcprofile" | "application/vnd.irepository.package+xml" | "application/vnd.is-xpr" | "application/vnd.isac.fcs" | "application/vnd.jam" | "application/vnd.jcp.javame.midlet-rms" | "application/vnd.jisp" | "application/vnd.joost.joda-archive" | "application/vnd.kahootz" | "application/vnd.kde.karbon" | "application/vnd.kde.kchart" | "application/vnd.kde.kformula" | "application/vnd.kde.kivio" | "application/vnd.kde.kontour" | "application/vnd.kde.kpresenter" | "application/vnd.kde.kspread" | "application/vnd.kde.kword" | "application/vnd.kenameaapp" | "application/vnd.kidspiration" | "application/vnd.kinar" | "application/vnd.koan" | "application/vnd.kodak-descriptor" | "application/vnd.las.las+xml" | "application/vnd.llamagraphics.life-balance.desktop" | "application/vnd.llamagraphics.life-balance.exchange+xml" | "application/vnd.lotus-1-2-3" | "application/vnd.lotus-approach" | "application/vnd.lotus-freelance" | "application/vnd.lotus-notes" | "application/vnd.lotus-organizer" | "application/vnd.lotus-screencam" | "application/vnd.lotus-wordpro" | "application/vnd.macports.portpkg" | "application/vnd.mapbox-vector-tile" | "application/vnd.mcd" | "application/vnd.medcalcdata" | "application/vnd.mediastation.cdkey" | "application/vnd.microsoft.portable-executable" | "application/vnd.mfer" | "application/vnd.mfmp" | "application/vnd.micrografx.flo" | "application/vnd.micrografx.igx" | "application/vnd.mif" | "application/vnd.mobius.daf" | "application/vnd.mobius.dis" | "application/vnd.mobius.mbk" | "application/vnd.mobius.mqy" | "application/vnd.mobius.msl" | "application/vnd.mobius.plc" | "application/vnd.mobius.txf" | "application/vnd.mophun.application" | "application/vnd.mophun.certificate" | "application/vnd.mozilla.xul+xml" | "application/vnd.ms-artgalry" | "application/vnd.ms-cab-compressed" | "application/vnd.ms-excel" | "application/vnd.ms-excel.addin.macroenabled.12" | "application/vnd.ms-excel.sheet.binary.macroenabled.12" | "application/vnd.ms-excel.sheet.macroenabled.12" | "application/vnd.ms-excel.template.macroenabled.12" | "application/vnd.ms-fontobject" | "application/vnd.ms-htmlhelp" | "application/vnd.ms-ims" | "application/vnd.ms-lrm" | "application/vnd.ms-officetheme" | "application/vnd.ms-pki.seccat" | "application/vnd.ms-pki.stl" | "application/vnd.ms-powerpoint" | "application/vnd.ms-powerpoint.addin.macroenabled.12" | "application/vnd.ms-powerpoint.presentation.macroenabled.12" | "application/vnd.ms-powerpoint.slide.macroenabled.12" | "application/vnd.ms-powerpoint.slideshow.macroenabled.12" | "application/vnd.ms-powerpoint.template.macroenabled.12" | "application/vnd.ms-project" | "application/vnd.ms-word.document.macroenabled.12" | "application/vnd.ms-word.template.macroenabled.12" | "application/vnd.ms-works" | "application/vnd.ms-wpl" | "application/vnd.ms-xpsdocument" | "application/vnd.mseq" | "application/vnd.musician" | "application/vnd.muvee.style" | "application/vnd.mynfc" | "application/vnd.neurolanguage.nlu" | "application/vnd.nitf" | "application/vnd.noblenet-directory" | "application/vnd.noblenet-sealer" | "application/vnd.noblenet-web" | "application/vnd.nokia.n-gage.ac+xml" | "application/vnd.nokia.n-gage.data" | "application/vnd.nokia.n-gage.symbian.install" | "application/vnd.nokia.radio-preset" | "application/vnd.nokia.radio-presets" | "application/vnd.novadigm.edm" | "application/vnd.novadigm.edx" | "application/vnd.novadigm.ext" | "application/vnd.oasis.opendocument.chart" | "application/vnd.oasis.opendocument.chart-template" | "application/vnd.oasis.opendocument.database" | "application/vnd.oasis.opendocument.formula" | "application/vnd.oasis.opendocument.formula-template" | "application/vnd.oasis.opendocument.graphics" | "application/vnd.oasis.opendocument.graphics-template" | "application/vnd.oasis.opendocument.image" | "application/vnd.oasis.opendocument.image-template" | "application/vnd.oasis.opendocument.presentation" | "application/vnd.oasis.opendocument.presentation-template" | "application/vnd.oasis.opendocument.spreadsheet" | "application/vnd.oasis.opendocument.spreadsheet-template" | "application/vnd.oasis.opendocument.text" | "application/vnd.oasis.opendocument.text-master" | "application/vnd.oasis.opendocument.text-template" | "application/vnd.oasis.opendocument.text-web" | "application/vnd.olpc-sugar" | "application/vnd.oma.dd2+xml" | "application/vnd.openblox.game+xml" | "application/vnd.openofficeorg.extension" | "application/vnd.openstreetmap.data+xml" | "application/vnd.openxmlformats-officedocument.presentationml.presentation" | "application/vnd.openxmlformats-officedocument.presentationml.slide" | "application/vnd.openxmlformats-officedocument.presentationml.slideshow" | "application/vnd.openxmlformats-officedocument.presentationml.template" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/vnd.openxmlformats-officedocument.spreadsheetml.template" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.openxmlformats-officedocument.wordprocessingml.template" | "application/vnd.osgeo.mapguide.package" | "application/vnd.osgi.dp" | "application/vnd.osgi.subsystem" | "application/vnd.palm" | "application/vnd.pawaafile" | "application/vnd.pg.format" | "application/vnd.pg.osasli" | "application/vnd.picsel" | "application/vnd.pmi.widget" | "application/vnd.pocketlearn" | "application/vnd.powerbuilder6" | "application/vnd.previewsystems.box" | "application/vnd.proteus.magazine" | "application/vnd.publishare-delta-tree" | "application/vnd.pvi.ptid1" | "application/vnd.quark.quarkxpress" | "application/vnd.rar" | "application/vnd.realvnc.bed" | "application/vnd.recordare.musicxml" | "application/vnd.recordare.musicxml+xml" | "application/vnd.rig.cryptonote" | "application/vnd.rim.cod" | "application/vnd.rn-realmedia" | "application/vnd.rn-realmedia-vbr" | "application/vnd.route66.link66+xml" | "application/vnd.sailingtracker.track" | "application/vnd.seemail" | "application/vnd.sema" | "application/vnd.semd" | "application/vnd.semf" | "application/vnd.shana.informed.formdata" | "application/vnd.shana.informed.formtemplate" | "application/vnd.shana.informed.interchange" | "application/vnd.shana.informed.package" | "application/vnd.simtech-mindmapper" | "application/vnd.smaf" | "application/vnd.smart.teacher" | "application/vnd.sqlite3" | "application/vnd.software602.filler.form+xml" | "application/vnd.solent.sdkm+xml" | "application/vnd.spotfire.dxp" | "application/vnd.spotfire.sfs" | "application/vnd.stardivision.calc" | "application/vnd.stardivision.draw" | "application/vnd.stardivision.impress" | "application/vnd.stardivision.math" | "application/vnd.stardivision.writer" | "application/vnd.stardivision.writer-global" | "application/vnd.stepmania.package" | "application/vnd.stepmania.stepchart" | "application/vnd.sun.wadl+xml" | "application/vnd.sun.xml.calc" | "application/vnd.sun.xml.calc.template" | "application/vnd.sun.xml.draw" | "application/vnd.sun.xml.draw.template" | "application/vnd.sun.xml.impress" | "application/vnd.sun.xml.impress.template" | "application/vnd.sun.xml.math" | "application/vnd.sun.xml.writer" | "application/vnd.sun.xml.writer.global" | "application/vnd.sun.xml.writer.template" | "application/vnd.sus-calendar" | "application/vnd.svd" | "application/vnd.symbian.install" | "application/vnd.syncml+xml" | "application/vnd.syncml.dm+wbxml" | "application/vnd.syncml.dm+xml" | "application/vnd.syncml.dmddf+xml" | "application/vnd.tao.intent-module-archive" | "application/vnd.tcpdump.pcap" | "application/vnd.tmobile-livetv" | "application/vnd.trid.tpt" | "application/vnd.triscape.mxs" | "application/vnd.trueapp" | "application/vnd.ufdl" | "application/vnd.uiq.theme" | "application/vnd.umajin" | "application/vnd.unity" | "application/vnd.uoml+xml" | "application/vnd.vcx" | "application/vnd.visio" | "application/vnd.visionary" | "application/vnd.vsf" | "application/vnd.wap.wbxml" | "application/vnd.wap.wmlc" | "application/vnd.wap.wmlscriptc" | "application/vnd.webturbo" | "application/vnd.wolfram.player" | "application/vnd.wordperfect" | "application/vnd.wqd" | "application/vnd.wt.stf" | "application/vnd.xara" | "application/vnd.xfdl" | "application/vnd.yamaha.hv-dic" | "application/vnd.yamaha.hv-script" | "application/vnd.yamaha.hv-voice" | "application/vnd.yamaha.openscoreformat" | "application/vnd.yamaha.openscoreformat.osfpvg+xml" | "application/vnd.yamaha.smaf-audio" | "application/vnd.yamaha.smaf-phrase" | "application/vnd.yellowriver-custom-menu" | "application/vnd.zul" | "application/vnd.zzazz.deck+xml" | "application/voicexml+xml" | "application/wasm" | "application/watcherinfo+xml" | "application/widget" | "application/winhlp" | "application/wsdl+xml" | "application/wspolicy+xml" | "application/x-7z-compressed" | "application/x-abiword" | "application/x-ace-compressed" | "application/x-archive" | "application/x-apple-diskimage" | "application/x-authorware-bin" | "application/x-authorware-map" | "application/x-authorware-seg" | "application/x-bcpio" | "application/x-bittorrent" | "application/x-blender" | "application/x-blorb" | "application/x-bzip" | "application/x-bzip2" | "application/x-cbr" | "application/x-cdlink" | "application/x-cfs-compressed" | "application/x-chat" | "application/x-chess-pgn" | "application/x-cocoa" | "application/x-compress" | "application/x-compressed-tar" | "application/x-conference" | "application/x-cpio" | "application/x-csh" | "application/x-debian-package" | "application/x-dgc-compressed" | "application/x-director" | "application/x-doom" | "application/x-dtbncx+xml" | "application/x-dtbook+xml" | "application/x-dtbresource+xml" | "application/x-dvi" | "application/x-envoy" | "application/x-eva" | "application/x-font-bdf" | "application/x-font-ghostscript" | "application/x-font-linux-psf" | "application/x-font-pcf" | "application/x-font-snf" | "application/x-font-type1" | "application/x-freearc" | "application/x-futuresplash" | "application/x-gca-compressed" | "application/x-glulx" | "application/x-gnumeric" | "application/x-gramps-xml" | "application/x-gtar" | "application/x-hdf" | "application/x-install-instructions" | "application/x-iso9660-image" | "application/x-java-archive-diff" | "application/x-java-jnlp-file" | "application/x-latex" | "application/x-lzh-compressed" | "application/x-makeself" | "application/x-mie" | "application/x-mobipocket-ebook" | "application/x-ms-application" | "application/x-ms-shortcut" | "application/x-ms-wmd" | "application/x-ms-wmz" | "application/x-ms-xbap" | "application/x-msaccess" | "application/x-msbinder" | "application/x-mscardfile" | "application/x-msclip" | "application/x-msdownload" | "application/x-msmediaview" | "application/x-msmetafile" | "application/x-msmoney" | "application/x-mspublisher" | "application/x-msschedule" | "application/x-msterminal" | "application/x-mswrite" | "application/x-netcdf" | "application/x-nzb" | "application/x-object" | "application/x-perl" | "application/x-pilot" | "application/x-pkcs12" | "application/x-pkcs7-certificates" | "application/x-pkcs7-certreqresp" | "application/x-python-bytecode" | "application/x-rar-compressed" | "application/x-redhat-package-manager" | "application/x-research-info-systems" | "application/x-sea" | "application/x-sh" | "application/x-shar" | "application/x-shockwave-flash" | "application/x-silverlight-app" | "application/x-sql" | "application/x-stuffit" | "application/x-stuffitx" | "application/x-subrip" | "application/x-sv4cpio" | "application/x-sv4crc" | "application/x-t3vm-image" | "application/x-tads" | "application/x-tar" | "application/x-tcl" | "application/x-tex" | "application/x-tex-tfm" | "application/x-texinfo" | "application/x-tgif" | "application/x-ustar" | "application/x-wais-source" | "application/x-x509-ca-cert" | "application/x-xfig" | "application/x-xliff+xml" | "application/x-xpinstall" | "application/x-xz" | "application/x-zmachine" | "application/xaml+xml" | "application/xcap-att+xml" | "application/xcap-caps+xml" | "application/xcap-diff+xml" | "application/xcap-el+xml" | "application/xcap-ns+xml" | "application/xenc+xml" | "application/xhtml+xml" | "application/xliff+xml" | "application/xml" | "application/xml-dtd" | "application/xop+xml" | "application/xproc+xml" | "application/xslt+xml" | "application/xspf+xml" | "application/xv+xml" | "application/yaml" | "application/yang" | "application/yin+xml" | "application/zip", ...("application/andrew-inset" | "application/applixware" | "application/atom+xml" | "application/atomcat+xml" | "application/atomdeleted+xml" | "application/atomsvc+xml" | "application/atsc-dwd+xml" | "application/atsc-held+xml" | "application/atsc-rsat+xml" | "application/calendar+xml" | "application/ccxml+xml" | "application/cdfx+xml" | "application/cdmi-capability" | "application/cdmi-container" | "application/cdmi-domain" | "application/cdmi-object" | "application/cdmi-queue" | "application/cpl+xml" | "application/cu-seeme" | "application/dash+xml" | "application/dash-patch+xml" | "application/davmount+xml" | "application/dicom" | "application/docbook+xml" | "application/dssc+der" | "application/dssc+xml" | "application/ecmascript" | "application/emma+xml" | "application/emotionml+xml" | "application/epub+zip" | "application/exi" | "application/express" | "application/fdt+xml" | "application/font-tdpfr" | "application/geo+json" | "application/gml+xml" | "application/gpx+xml" | "application/gxf" | "application/gzip" | "application/hyperstudio" | "application/inkml+xml" | "application/ipfix" | "application/its+xml" | "application/java-archive" | "application/java-serialized-object" | "application/java-vm" | "application/javascript" | "application/json" | "application/jsonml+json" | "application/ld+json" | "application/lgr+xml" | "application/lost+xml" | "application/mac-binhex40" | "application/mac-compactpro" | "application/mads+xml" | "application/manifest+json" | "application/marc" | "application/marcxml+xml" | "application/mathematica" | "application/mathml+xml" | "application/mbox" | "application/media-policy-dataset+xml" | "application/mediaservercontrol+xml" | "application/metalink+xml" | "application/metalink4+xml" | "application/mets+xml" | "application/mmt-aei+xml" | "application/mmt-usd+xml" | "application/mods+xml" | "application/mp21" | "application/mp4" | "application/msword" | "application/mxf" | "application/n-quads" | "application/n-triples" | "application/node" | "application/octet-stream" | "application/oda" | "application/oebps-package+xml" | "application/ogg" | "application/omdoc+xml" | "application/onenote" | "application/oxps" | "application/p2p-overlay+xml" | "application/patch-ops-error+xml" | "application/pdf" | "application/pgp-encrypted" | "application/pgp-keys" | "application/pgp-signature" | "application/pics-rules" | "application/pkcs10" | "application/pkcs7-mime" | "application/pkcs7-signature" | "application/pkcs8" | "application/pkix-attr-cert" | "application/pkix-cert" | "application/pkix-crl" | "application/pkix-pkipath" | "application/pkixcmp" | "application/pls+xml" | "application/postscript" | "application/provenance+xml" | "application/prs.cww" | "application/pskc+xml" | "application/rdf+xml" | "application/reginfo+xml" | "application/relax-ng-compact-syntax" | "application/resource-lists+xml" | "application/resource-lists-diff+xml" | "application/rls-services+xml" | "application/route-apd+xml" | "application/route-s-tsid+xml" | "application/route-usd+xml" | "application/rpki-ghostbusters" | "application/rpki-manifest" | "application/rpki-roa" | "application/rsd+xml" | "application/rss+xml" | "application/rtf" | "application/sbml+xml" | "application/scvp-cv-request" | "application/scvp-cv-response" | "application/scvp-vp-request" | "application/scvp-vp-response" | "application/sdp" | "application/senml+xml" | "application/sensml+xml" | "application/set-payment-initiation" | "application/set-registration-initiation" | "application/shf+xml" | "application/sieve" | "application/smil+xml" | "application/sparql-query" | "application/sparql-results+xml" | "application/srgs" | "application/srgs+xml" | "application/sru+xml" | "application/ssdl+xml" | "application/ssml+xml" | "application/swid+xml" | "application/tei+xml" | "application/thraud+xml" | "application/timestamped-data" | "application/trig" | "application/ttml+xml" | "application/urc-ressheet+xml" | "application/urc-targetdesc+xml" | "application/vnd.1000minds.decision-model+xml" | "application/vnd.3gpp.pic-bw-large" | "application/vnd.3gpp.pic-bw-small" | "application/vnd.3gpp.pic-bw-var" | "application/vnd.3gpp2.tcap" | "application/vnd.3m.post-it-notes" | "application/vnd.accpac.simply.aso" | "application/vnd.accpac.simply.imp" | "application/vnd.acucobol" | "application/vnd.acucorp" | "application/vnd.adobe.air-application-installer-package+zip" | "application/vnd.adobe.formscentral.fcdt" | "application/vnd.adobe.fxp" | "application/vnd.adobe.xdp+xml" | "application/vnd.adobe.xfdf" | "application/vnd.age" | "application/vnd.ahead.space" | "application/vnd.airzip.filesecure.azf" | "application/vnd.airzip.filesecure.azs" | "application/vnd.amazon.ebook" | "application/vnd.americandynamics.acc" | "application/vnd.amiga.ami" | "application/vnd.android.package-archive" | "application/vnd.anser-web-certificate-issue-initiation" | "application/vnd.anser-web-funds-transfer-initiation" | "application/vnd.antix.game-component" | "application/vnd.apple.installer+xml" | "application/vnd.apple.keynote" | "application/vnd.apple.mpegurl" | "application/vnd.apple.numbers" | "application/vnd.apple.pages" | "application/vnd.aristanetworks.swi" | "application/vnd.astraea-software.iota" | "application/vnd.audiograph" | "application/vnd.balsamiq.bmml+xml" | "application/vnd.blueice.multipass" | "application/vnd.bmi" | "application/vnd.businessobjects" | "application/vnd.chemdraw+xml" | "application/vnd.chipnuts.karaoke-mmd" | "application/vnd.cinderella" | "application/vnd.citationstyles.style+xml" | "application/vnd.claymore" | "application/vnd.cloanto.rp9" | "application/vnd.clonk.c4group" | "application/vnd.cluetrust.cartomobile-config" | "application/vnd.cluetrust.cartomobile-config-pkg" | "application/vnd.commonspace" | "application/vnd.contact.cmsg" | "application/vnd.cosmocaller" | "application/vnd.crick.clicker" | "application/vnd.crick.clicker.keyboard" | "application/vnd.crick.clicker.palette" | "application/vnd.crick.clicker.template" | "application/vnd.crick.clicker.wordbank" | "application/vnd.criticaltools.wbs+xml" | "application/vnd.ctc-posml" | "application/vnd.cups-ppd" | "application/vnd.curl.car" | "application/vnd.curl.pcurl" | "application/vnd.dart" | "application/vnd.data-vision.rdz" | "application/vnd.dbf" | "application/vnd.dece.data" | "application/vnd.dece.ttml+xml" | "application/vnd.dece.unspecified" | "application/vnd.dece.zip" | "application/vnd.denovo.fcselayout-link" | "application/vnd.dna" | "application/vnd.dolby.mlp" | "application/vnd.dpgraph" | "application/vnd.dreamfactory" | "application/vnd.dtg.local.flash" | "application/vnd.ds-keypoint" | "application/vnd.dvb.ait" | "application/vnd.dvb.service" | "application/vnd.dynageo" | "application/vnd.ecowin.chart" | "application/vnd.enliven" | "application/vnd.epson.esf" | "application/vnd.epson.msf" | "application/vnd.epson.quickanime" | "application/vnd.epson.salt" | "application/vnd.epson.ssf" | "application/vnd.eszigno3+xml" | "application/vnd.ezpix-album" | "application/vnd.ezpix-package" | "application/vnd.fdf" | "application/vnd.fdsn.mseed" | "application/vnd.fdsn.seed" | "application/vnd.flographit" | "application/vnd.fluxtime.clip" | "application/vnd.framemaker" | "application/vnd.frogans.fnc" | "application/vnd.frogans.ltf" | "application/vnd.fsc.weblaunch" | "application/vnd.fujitsu.oasys" | "application/vnd.fujitsu.oasys2" | "application/vnd.fujitsu.oasys3" | "application/vnd.fujitsu.oasysgp" | "application/vnd.fujitsu.oasysprs" | "application/vnd.fujixerox.ddd" | "application/vnd.fujixerox.docuworks" | "application/vnd.fujixerox.docuworks.binder" | "application/vnd.fuzzysheet" | "application/vnd.genomatix.tuxedo" | "application/vnd.geogebra.file" | "application/vnd.geogebra.tool" | "application/vnd.geometry-explorer" | "application/vnd.geonext" | "application/vnd.geoplan" | "application/vnd.geospace" | "application/vnd.gmx" | "application/vnd.google-earth.kml+xml" | "application/vnd.google-earth.kmz" | "application/vnd.grafeq" | "application/vnd.groove-account" | "application/vnd.groove-help" | "application/vnd.groove-identity-message" | "application/vnd.groove-injector" | "application/vnd.groove-tool-message" | "application/vnd.groove-tool-template" | "application/vnd.groove-vcard" | "application/vnd.hal+xml" | "application/vnd.handheld-entertainment+xml" | "application/vnd.hbci" | "application/vnd.hhe.lesson-player" | "application/vnd.hp-hpgl" | "application/vnd.hp-hpid" | "application/vnd.hp-hps" | "application/vnd.hp-jlyt" | "application/vnd.hp-pcl" | "application/vnd.hp-pclxl" | "application/vnd.hydrostatix.sof-data" | "application/vnd.ibm.minipay" | "application/vnd.ibm.modcap" | "application/vnd.ibm.rights-management" | "application/vnd.ibm.secure-container" | "application/vnd.iccprofile" | "application/vnd.igloader" | "application/vnd.immervision-ivp" | "application/vnd.immervision-ivu" | "application/vnd.insors.igm" | "application/vnd.intercon.formnet" | "application/vnd.intergeo" | "application/vnd.intu.qbo" | "application/vnd.intu.qfx" | "application/vnd.ipunplugged.rcprofile" | "application/vnd.irepository.package+xml" | "application/vnd.is-xpr" | "application/vnd.isac.fcs" | "application/vnd.jam" | "application/vnd.jcp.javame.midlet-rms" | "application/vnd.jisp" | "application/vnd.joost.joda-archive" | "application/vnd.kahootz" | "application/vnd.kde.karbon" | "application/vnd.kde.kchart" | "application/vnd.kde.kformula" | "application/vnd.kde.kivio" | "application/vnd.kde.kontour" | "application/vnd.kde.kpresenter" | "application/vnd.kde.kspread" | "application/vnd.kde.kword" | "application/vnd.kenameaapp" | "application/vnd.kidspiration" | "application/vnd.kinar" | "application/vnd.koan" | "application/vnd.kodak-descriptor" | "application/vnd.las.las+xml" | "application/vnd.llamagraphics.life-balance.desktop" | "application/vnd.llamagraphics.life-balance.exchange+xml" | "application/vnd.lotus-1-2-3" | "application/vnd.lotus-approach" | "application/vnd.lotus-freelance" | "application/vnd.lotus-notes" | "application/vnd.lotus-organizer" | "application/vnd.lotus-screencam" | "application/vnd.lotus-wordpro" | "application/vnd.macports.portpkg" | "application/vnd.mapbox-vector-tile" | "application/vnd.mcd" | "application/vnd.medcalcdata" | "application/vnd.mediastation.cdkey" | "application/vnd.microsoft.portable-executable" | "application/vnd.mfer" | "application/vnd.mfmp" | "application/vnd.micrografx.flo" | "application/vnd.micrografx.igx" | "application/vnd.mif" | "application/vnd.mobius.daf" | "application/vnd.mobius.dis" | "application/vnd.mobius.mbk" | "application/vnd.mobius.mqy" | "application/vnd.mobius.msl" | "application/vnd.mobius.plc" | "application/vnd.mobius.txf" | "application/vnd.mophun.application" | "application/vnd.mophun.certificate" | "application/vnd.mozilla.xul+xml" | "application/vnd.ms-artgalry" | "application/vnd.ms-cab-compressed" | "application/vnd.ms-excel" | "application/vnd.ms-excel.addin.macroenabled.12" | "application/vnd.ms-excel.sheet.binary.macroenabled.12" | "application/vnd.ms-excel.sheet.macroenabled.12" | "application/vnd.ms-excel.template.macroenabled.12" | "application/vnd.ms-fontobject" | "application/vnd.ms-htmlhelp" | "application/vnd.ms-ims" | "application/vnd.ms-lrm" | "application/vnd.ms-officetheme" | "application/vnd.ms-pki.seccat" | "application/vnd.ms-pki.stl" | "application/vnd.ms-powerpoint" | "application/vnd.ms-powerpoint.addin.macroenabled.12" | "application/vnd.ms-powerpoint.presentation.macroenabled.12" | "application/vnd.ms-powerpoint.slide.macroenabled.12" | "application/vnd.ms-powerpoint.slideshow.macroenabled.12" | "application/vnd.ms-powerpoint.template.macroenabled.12" | "application/vnd.ms-project" | "application/vnd.ms-word.document.macroenabled.12" | "application/vnd.ms-word.template.macroenabled.12" | "application/vnd.ms-works" | "application/vnd.ms-wpl" | "application/vnd.ms-xpsdocument" | "application/vnd.mseq" | "application/vnd.musician" | "application/vnd.muvee.style" | "application/vnd.mynfc" | "application/vnd.neurolanguage.nlu" | "application/vnd.nitf" | "application/vnd.noblenet-directory" | "application/vnd.noblenet-sealer" | "application/vnd.noblenet-web" | "application/vnd.nokia.n-gage.ac+xml" | "application/vnd.nokia.n-gage.data" | "application/vnd.nokia.n-gage.symbian.install" | "application/vnd.nokia.radio-preset" | "application/vnd.nokia.radio-presets" | "application/vnd.novadigm.edm" | "application/vnd.novadigm.edx" | "application/vnd.novadigm.ext" | "application/vnd.oasis.opendocument.chart" | "application/vnd.oasis.opendocument.chart-template" | "application/vnd.oasis.opendocument.database" | "application/vnd.oasis.opendocument.formula" | "application/vnd.oasis.opendocument.formula-template" | "application/vnd.oasis.opendocument.graphics" | "application/vnd.oasis.opendocument.graphics-template" | "application/vnd.oasis.opendocument.image" | "application/vnd.oasis.opendocument.image-template" | "application/vnd.oasis.opendocument.presentation" | "application/vnd.oasis.opendocument.presentation-template" | "application/vnd.oasis.opendocument.spreadsheet" | "application/vnd.oasis.opendocument.spreadsheet-template" | "application/vnd.oasis.opendocument.text" | "application/vnd.oasis.opendocument.text-master" | "application/vnd.oasis.opendocument.text-template" | "application/vnd.oasis.opendocument.text-web" | "application/vnd.olpc-sugar" | "application/vnd.oma.dd2+xml" | "application/vnd.openblox.game+xml" | "application/vnd.openofficeorg.extension" | "application/vnd.openstreetmap.data+xml" | "application/vnd.openxmlformats-officedocument.presentationml.presentation" | "application/vnd.openxmlformats-officedocument.presentationml.slide" | "application/vnd.openxmlformats-officedocument.presentationml.slideshow" | "application/vnd.openxmlformats-officedocument.presentationml.template" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/vnd.openxmlformats-officedocument.spreadsheetml.template" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.openxmlformats-officedocument.wordprocessingml.template" | "application/vnd.osgeo.mapguide.package" | "application/vnd.osgi.dp" | "application/vnd.osgi.subsystem" | "application/vnd.palm" | "application/vnd.pawaafile" | "application/vnd.pg.format" | "application/vnd.pg.osasli" | "application/vnd.picsel" | "application/vnd.pmi.widget" | "application/vnd.pocketlearn" | "application/vnd.powerbuilder6" | "application/vnd.previewsystems.box" | "application/vnd.proteus.magazine" | "application/vnd.publishare-delta-tree" | "application/vnd.pvi.ptid1" | "application/vnd.quark.quarkxpress" | "application/vnd.rar" | "application/vnd.realvnc.bed" | "application/vnd.recordare.musicxml" | "application/vnd.recordare.musicxml+xml" | "application/vnd.rig.cryptonote" | "application/vnd.rim.cod" | "application/vnd.rn-realmedia" | "application/vnd.rn-realmedia-vbr" | "application/vnd.route66.link66+xml" | "application/vnd.sailingtracker.track" | "application/vnd.seemail" | "application/vnd.sema" | "application/vnd.semd" | "application/vnd.semf" | "application/vnd.shana.informed.formdata" | "application/vnd.shana.informed.formtemplate" | "application/vnd.shana.informed.interchange" | "application/vnd.shana.informed.package" | "application/vnd.simtech-mindmapper" | "application/vnd.smaf" | "application/vnd.smart.teacher" | "application/vnd.sqlite3" | "application/vnd.software602.filler.form+xml" | "application/vnd.solent.sdkm+xml" | "application/vnd.spotfire.dxp" | "application/vnd.spotfire.sfs" | "application/vnd.stardivision.calc" | "application/vnd.stardivision.draw" | "application/vnd.stardivision.impress" | "application/vnd.stardivision.math" | "application/vnd.stardivision.writer" | "application/vnd.stardivision.writer-global" | "application/vnd.stepmania.package" | "application/vnd.stepmania.stepchart" | "application/vnd.sun.wadl+xml" | "application/vnd.sun.xml.calc" | "application/vnd.sun.xml.calc.template" | "application/vnd.sun.xml.draw" | "application/vnd.sun.xml.draw.template" | "application/vnd.sun.xml.impress" | "application/vnd.sun.xml.impress.template" | "application/vnd.sun.xml.math" | "application/vnd.sun.xml.writer" | "application/vnd.sun.xml.writer.global" | "application/vnd.sun.xml.writer.template" | "application/vnd.sus-calendar" | "application/vnd.svd" | "application/vnd.symbian.install" | "application/vnd.syncml+xml" | "application/vnd.syncml.dm+wbxml" | "application/vnd.syncml.dm+xml" | "application/vnd.syncml.dmddf+xml" | "application/vnd.tao.intent-module-archive" | "application/vnd.tcpdump.pcap" | "application/vnd.tmobile-livetv" | "application/vnd.trid.tpt" | "application/vnd.triscape.mxs" | "application/vnd.trueapp" | "application/vnd.ufdl" | "application/vnd.uiq.theme" | "application/vnd.umajin" | "application/vnd.unity" | "application/vnd.uoml+xml" | "application/vnd.vcx" | "application/vnd.visio" | "application/vnd.visionary" | "application/vnd.vsf" | "application/vnd.wap.wbxml" | "application/vnd.wap.wmlc" | "application/vnd.wap.wmlscriptc" | "application/vnd.webturbo" | "application/vnd.wolfram.player" | "application/vnd.wordperfect" | "application/vnd.wqd" | "application/vnd.wt.stf" | "application/vnd.xara" | "application/vnd.xfdl" | "application/vnd.yamaha.hv-dic" | "application/vnd.yamaha.hv-script" | "application/vnd.yamaha.hv-voice" | "application/vnd.yamaha.openscoreformat" | "application/vnd.yamaha.openscoreformat.osfpvg+xml" | "application/vnd.yamaha.smaf-audio" | "application/vnd.yamaha.smaf-phrase" | "application/vnd.yellowriver-custom-menu" | "application/vnd.zul" | "application/vnd.zzazz.deck+xml" | "application/voicexml+xml" | "application/wasm" | "application/watcherinfo+xml" | "application/widget" | "application/winhlp" | "application/wsdl+xml" | "application/wspolicy+xml" | "application/x-7z-compressed" | "application/x-abiword" | "application/x-ace-compressed" | "application/x-archive" | "application/x-apple-diskimage" | "application/x-authorware-bin" | "application/x-authorware-map" | "application/x-authorware-seg" | "application/x-bcpio" | "application/x-bittorrent" | "application/x-blender" | "application/x-blorb" | "application/x-bzip" | "application/x-bzip2" | "application/x-cbr" | "application/x-cdlink" | "application/x-cfs-compressed" | "application/x-chat" | "application/x-chess-pgn" | "application/x-cocoa" | "application/x-compress" | "application/x-compressed-tar" | "application/x-conference" | "application/x-cpio" | "application/x-csh" | "application/x-debian-package" | "application/x-dgc-compressed" | "application/x-director" | "application/x-doom" | "application/x-dtbncx+xml" | "application/x-dtbook+xml" | "application/x-dtbresource+xml" | "application/x-dvi" | "application/x-envoy" | "application/x-eva" | "application/x-font-bdf" | "application/x-font-ghostscript" | "application/x-font-linux-psf" | "application/x-font-pcf" | "application/x-font-snf" | "application/x-font-type1" | "application/x-freearc" | "application/x-futuresplash" | "application/x-gca-compressed" | "application/x-glulx" | "application/x-gnumeric" | "application/x-gramps-xml" | "application/x-gtar" | "application/x-hdf" | "application/x-install-instructions" | "application/x-iso9660-image" | "application/x-java-archive-diff" | "application/x-java-jnlp-file" | "application/x-latex" | "application/x-lzh-compressed" | "application/x-makeself" | "application/x-mie" | "application/x-mobipocket-ebook" | "application/x-ms-application" | "application/x-ms-shortcut" | "application/x-ms-wmd" | "application/x-ms-wmz" | "application/x-ms-xbap" | "application/x-msaccess" | "application/x-msbinder" | "application/x-mscardfile" | "application/x-msclip" | "application/x-msdownload" | "application/x-msmediaview" | "application/x-msmetafile" | "application/x-msmoney" | "application/x-mspublisher" | "application/x-msschedule" | "application/x-msterminal" | "application/x-mswrite" | "application/x-netcdf" | "application/x-nzb" | "application/x-object" | "application/x-perl" | "application/x-pilot" | "application/x-pkcs12" | "application/x-pkcs7-certificates" | "application/x-pkcs7-certreqresp" | "application/x-python-bytecode" | "application/x-rar-compressed" | "application/x-redhat-package-manager" | "application/x-research-info-systems" | "application/x-sea" | "application/x-sh" | "application/x-shar" | "application/x-shockwave-flash" | "application/x-silverlight-app" | "application/x-sql" | "application/x-stuffit" | "application/x-stuffitx" | "application/x-subrip" | "application/x-sv4cpio" | "application/x-sv4crc" | "application/x-t3vm-image" | "application/x-tads" | "application/x-tar" | "application/x-tcl" | "application/x-tex" | "application/x-tex-tfm" | "application/x-texinfo" | "application/x-tgif" | "application/x-ustar" | "application/x-wais-source" | "application/x-x509-ca-cert" | "application/x-xfig" | "application/x-xliff+xml" | "application/x-xpinstall" | "application/x-xz" | "application/x-zmachine" | "application/xaml+xml" | "application/xcap-att+xml" | "application/xcap-caps+xml" | "application/xcap-diff+xml" | "application/xcap-el+xml" | "application/xcap-ns+xml" | "application/xenc+xml" | "application/xhtml+xml" | "application/xliff+xml" | "application/xml" | "application/xml-dtd" | "application/xop+xml" | "application/xproc+xml" | "application/xslt+xml" | "application/xspf+xml" | "application/xv+xml" | "application/yaml" | "application/yang" | "application/yin+xml" | "application/zip")[]], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L168)

Since v0.0.0

## AudioMimeType

Schema for `audio/*` mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { AudioMimeType } from "@beep/schema/MimeType"

const program = S.decodeUnknownEffect(AudioMimeType)("audio/mpeg")

Effect.runPromise(program)
```

**Signature**

```ts
declare const AudioMimeType: LiteralKit<readonly ["audio/3gpp" | "audio/adpcm" | "audio/amr" | "audio/basic" | "audio/midi" | "audio/mobile-xmf" | "audio/mp4" | "audio/mpeg" | "audio/ogg" | "audio/s3m" | "audio/silk" | "audio/vnd.dece.audio" | "audio/vnd.digital-winds" | "audio/vnd.dra" | "audio/vnd.dts" | "audio/vnd.dts.hd" | "audio/vnd.lucent.voice" | "audio/vnd.ms-playready.media.pya" | "audio/vnd.nuera.ecelp4800" | "audio/vnd.nuera.ecelp7470" | "audio/vnd.nuera.ecelp9600" | "audio/vnd.rip" | "audio/wav" | "audio/webm" | "audio/x-aac" | "audio/x-aiff" | "audio/x-caf" | "audio/x-flac" | "audio/x-m4a" | "audio/x-matroska" | "audio/x-mpegurl" | "audio/x-ms-wax" | "audio/x-ms-wma" | "audio/x-pn-realaudio" | "audio/x-pn-realaudio-plugin" | "audio/x-realaudio" | "audio/x-wav" | "audio/x-gsm" | "audio/xm", ...("audio/3gpp" | "audio/adpcm" | "audio/amr" | "audio/basic" | "audio/midi" | "audio/mobile-xmf" | "audio/mp4" | "audio/mpeg" | "audio/ogg" | "audio/s3m" | "audio/silk" | "audio/vnd.dece.audio" | "audio/vnd.digital-winds" | "audio/vnd.dra" | "audio/vnd.dts" | "audio/vnd.dts.hd" | "audio/vnd.lucent.voice" | "audio/vnd.ms-playready.media.pya" | "audio/vnd.nuera.ecelp4800" | "audio/vnd.nuera.ecelp7470" | "audio/vnd.nuera.ecelp9600" | "audio/vnd.rip" | "audio/wav" | "audio/webm" | "audio/x-aac" | "audio/x-aiff" | "audio/x-caf" | "audio/x-flac" | "audio/x-m4a" | "audio/x-matroska" | "audio/x-mpegurl" | "audio/x-ms-wax" | "audio/x-ms-wma" | "audio/x-pn-realaudio" | "audio/x-pn-realaudio-plugin" | "audio/x-realaudio" | "audio/x-wav" | "audio/x-gsm" | "audio/xm")[]], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L337)

Since v0.0.0

## ImageMimeType

Schema for `image/*` mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { ImageMimeType } from "@beep/schema/MimeType"

const program = S.decodeUnknownEffect(ImageMimeType)("image/png")

Effect.runPromise(program)
```

**Signature**

```ts
declare const ImageMimeType: LiteralKit<readonly ["image/aces" | "image/avci" | "image/avcs" | "image/avif" | "image/bmp" | "image/cgm" | "image/dicom-rle" | "image/emf" | "image/fits" | "image/g3fax" | "image/gif" | "image/heic" | "image/heic-sequence" | "image/heif" | "image/heif-sequence" | "image/hej2k" | "image/hsj2" | "image/ief" | "image/jls" | "image/jp2" | "image/jpeg" | "image/jph" | "image/jphc" | "image/jpm" | "image/jpx" | "image/jxr" | "image/jxra" | "image/jxrs" | "image/jxs" | "image/jxsc" | "image/jxsi" | "image/jxss" | "image/ktx" | "image/ktx2" | "image/png" | "image/prs.btif" | "image/prs.pti" | "image/sgi" | "image/svg+xml" | "image/t38" | "image/tiff" | "image/tiff-fx" | "image/vnd.adobe.photoshop" | "image/vnd.airzip.accelerator.azv" | "image/vnd.dece.graphic" | "image/vnd.djvu" | "image/vnd.dvb.subtitle" | "image/vnd.dwg" | "image/vnd.dxf" | "image/vnd.fastbidsheet" | "image/vnd.fpx" | "image/vnd.fst" | "image/vnd.fujixerox.edmics-mmr" | "image/vnd.fujixerox.edmics-rlc" | "image/vnd.microsoft.icon" | "image/vnd.ms-modi" | "image/vnd.ms-photo" | "image/vnd.net-fpx" | "image/vnd.pco.b16" | "image/vnd.tencent.tap" | "image/vnd.valve.source.texture" | "image/vnd.wap.wbmp" | "image/vnd.xiff" | "image/vnd.zbrush.pcx" | "image/webp" | "image/wmf" | "image/x-3ds" | "image/x-cmu-raster" | "image/x-cmx" | "image/x-freehand" | "image/x-icon" | "image/x-jng" | "image/x-mrsid-image" | "image/x-ms-bmp" | "image/x-pcx" | "image/x-pict" | "image/x-portable-anymap" | "image/x-portable-bitmap" | "image/x-portable-graymap" | "image/x-portable-pixmap" | "image/x-rgb" | "image/x-tga" | "image/x-xbitmap" | "image/x-xpixmap" | "image/x-xwindowdump", ...("image/aces" | "image/avci" | "image/avcs" | "image/avif" | "image/bmp" | "image/cgm" | "image/dicom-rle" | "image/emf" | "image/fits" | "image/g3fax" | "image/gif" | "image/heic" | "image/heic-sequence" | "image/heif" | "image/heif-sequence" | "image/hej2k" | "image/hsj2" | "image/ief" | "image/jls" | "image/jp2" | "image/jpeg" | "image/jph" | "image/jphc" | "image/jpm" | "image/jpx" | "image/jxr" | "image/jxra" | "image/jxrs" | "image/jxs" | "image/jxsc" | "image/jxsi" | "image/jxss" | "image/ktx" | "image/ktx2" | "image/png" | "image/prs.btif" | "image/prs.pti" | "image/sgi" | "image/svg+xml" | "image/t38" | "image/tiff" | "image/tiff-fx" | "image/vnd.adobe.photoshop" | "image/vnd.airzip.accelerator.azv" | "image/vnd.dece.graphic" | "image/vnd.djvu" | "image/vnd.dvb.subtitle" | "image/vnd.dwg" | "image/vnd.dxf" | "image/vnd.fastbidsheet" | "image/vnd.fpx" | "image/vnd.fst" | "image/vnd.fujixerox.edmics-mmr" | "image/vnd.fujixerox.edmics-rlc" | "image/vnd.microsoft.icon" | "image/vnd.ms-modi" | "image/vnd.ms-photo" | "image/vnd.net-fpx" | "image/vnd.pco.b16" | "image/vnd.tencent.tap" | "image/vnd.valve.source.texture" | "image/vnd.wap.wbmp" | "image/vnd.xiff" | "image/vnd.zbrush.pcx" | "image/webp" | "image/wmf" | "image/x-3ds" | "image/x-cmu-raster" | "image/x-cmx" | "image/x-freehand" | "image/x-icon" | "image/x-jng" | "image/x-mrsid-image" | "image/x-ms-bmp" | "image/x-pcx" | "image/x-pict" | "image/x-portable-anymap" | "image/x-portable-bitmap" | "image/x-portable-graymap" | "image/x-portable-pixmap" | "image/x-rgb" | "image/x-tga" | "image/x-xbitmap" | "image/x-xpixmap" | "image/x-xwindowdump")[]], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L295)

Since v0.0.0

## MimeType

Schema kit that covers all supported mime types with per-category sub-schemas.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { MimeType } from "@beep/schema/MimeType"

const program = S.decodeUnknownEffect(MimeType)("application/json")

Effect.runPromise(program)
```

**Signature**

```ts
declare const MimeType: MimeTypeSchema
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L100)

Since v0.0.0

## MiscMimeType

Schema for miscellaneous mime-type literals that do not fit standard categories.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { MiscMimeType } from "@beep/schema/MimeType"

const program = S.decodeUnknownEffect(MiscMimeType)("font/woff2")

Effect.runPromise(program)
```

**Signature**

```ts
declare const MiscMimeType: LiteralKit<readonly ["chemical/x-cdx" | "chemical/x-cif" | "chemical/x-cmdf" | "chemical/x-cml" | "chemical/x-csml" | "chemical/x-xyz" | "font/collection" | "font/otf" | "font/ttf" | "font/woff" | "font/woff2" | "message/disposition-notification" | "message/global" | "message/global-delivery-status" | "message/global-disposition-notification" | "message/global-headers" | "message/rfc822" | "message/vnd.wfa.wsc" | "model/3mf" | "model/gltf+json" | "model/gltf-binary" | "model/iges" | "model/mesh" | "model/mtl" | "model/obj" | "model/step" | "model/step+xml" | "model/step+zip" | "model/step-xml+zip" | "model/stl" | "model/vnd.collada+xml" | "model/vnd.dwf" | "model/vnd.gdl" | "model/vnd.gtw" | "model/vnd.mts" | "model/vnd.opengex" | "model/vnd.parasolid.transmit.binary" | "model/vnd.parasolid.transmit.text" | "model/vnd.sap.vds" | "model/vnd.usdz+zip" | "model/vnd.valve.source.compiled-map" | "model/vnd.vtu" | "model/vrml" | "model/x3d+binary" | "model/x3d+fastinfoset" | "model/x3d+vrml" | "model/x3d+xml" | "model/x3d-vrml" | "x-conference/x-cooltalk", ...("chemical/x-cdx" | "chemical/x-cif" | "chemical/x-cmdf" | "chemical/x-cml" | "chemical/x-csml" | "chemical/x-xyz" | "font/collection" | "font/otf" | "font/ttf" | "font/woff" | "font/woff2" | "message/disposition-notification" | "message/global" | "message/global-delivery-status" | "message/global-disposition-notification" | "message/global-headers" | "message/rfc822" | "message/vnd.wfa.wsc" | "model/3mf" | "model/gltf+json" | "model/gltf-binary" | "model/iges" | "model/mesh" | "model/mtl" | "model/obj" | "model/step" | "model/step+xml" | "model/step+zip" | "model/step-xml+zip" | "model/stl" | "model/vnd.collada+xml" | "model/vnd.dwf" | "model/vnd.gdl" | "model/vnd.gtw" | "model/vnd.mts" | "model/vnd.opengex" | "model/vnd.parasolid.transmit.binary" | "model/vnd.parasolid.transmit.text" | "model/vnd.sap.vds" | "model/vnd.usdz+zip" | "model/vnd.valve.source.compiled-map" | "model/vnd.vtu" | "model/vrml" | "model/x3d+binary" | "model/x3d+fastinfoset" | "model/x3d+vrml" | "model/x3d+xml" | "model/x3d-vrml" | "x-conference/x-cooltalk")[]], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L379)

Since v0.0.0

## TextMimeType

Schema for `text/*` mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { TextMimeType } from "@beep/schema/MimeType"

const program = S.decodeUnknownEffect(TextMimeType)("text/plain")

Effect.runPromise(program)
```

**Signature**

```ts
declare const TextMimeType: LiteralKit<readonly ["text/cache-manifest" | "text/calendar" | "text/css" | "text/csv" | "text/html" | "text/markdown" | "text/mathml" | "text/n3" | "text/plain" | "text/prs.lines.tag" | "text/richtext" | "text/rtf" | "text/sgml" | "text/shex" | "text/spdx" | "text/tab-separated-values" | "text/troff" | "text/turtle" | "text/uri-list" | "text/vcard" | "text/vnd.curl" | "text/vnd.curl.dcurl" | "text/vnd.curl.mcurl" | "text/vnd.curl.scurl" | "text/vnd.dvb.subtitle" | "text/vnd.familysearch.gedcom" | "text/vnd.fly" | "text/vnd.fmi.flexstor" | "text/vnd.graphviz" | "text/vnd.in3d.3dml" | "text/vnd.in3d.spot" | "text/vnd.sun.j2me.app-descriptor" | "text/vnd.wap.wml" | "text/vnd.wap.wmlscript" | "text/vtt" | "text/x-asm" | "text/x-c" | "text/x-component" | "text/x-fortran" | "text/x-java-source" | "text/x-nfo" | "text/x-opml" | "text/x-pascal" | "text/x-setext" | "text/x-sfv" | "text/x-uuencode" | "text/x-vcalendar" | "text/x-vcard" | "text/xml", ...("text/cache-manifest" | "text/calendar" | "text/css" | "text/csv" | "text/html" | "text/markdown" | "text/mathml" | "text/n3" | "text/plain" | "text/prs.lines.tag" | "text/richtext" | "text/rtf" | "text/sgml" | "text/shex" | "text/spdx" | "text/tab-separated-values" | "text/troff" | "text/turtle" | "text/uri-list" | "text/vcard" | "text/vnd.curl" | "text/vnd.curl.dcurl" | "text/vnd.curl.mcurl" | "text/vnd.curl.scurl" | "text/vnd.dvb.subtitle" | "text/vnd.familysearch.gedcom" | "text/vnd.fly" | "text/vnd.fmi.flexstor" | "text/vnd.graphviz" | "text/vnd.in3d.3dml" | "text/vnd.in3d.spot" | "text/vnd.sun.j2me.app-descriptor" | "text/vnd.wap.wml" | "text/vnd.wap.wmlscript" | "text/vtt" | "text/x-asm" | "text/x-c" | "text/x-component" | "text/x-fortran" | "text/x-java-source" | "text/x-nfo" | "text/x-opml" | "text/x-pascal" | "text/x-setext" | "text/x-sfv" | "text/x-uuencode" | "text/x-vcalendar" | "text/x-vcard" | "text/xml")[]], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L253)

Since v0.0.0

## VideoMimeType

Schema for `video/*` mime-type literals.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { VideoMimeType } from "@beep/schema/MimeType"

const program = S.decodeUnknownEffect(VideoMimeType)("video/mp4")

Effect.runPromise(program)
```

**Signature**

```ts
declare const VideoMimeType: LiteralKit<readonly ["video/3gpp" | "video/3gpp2" | "video/h261" | "video/h263" | "video/h264" | "video/iso.segment" | "video/jpeg" | "video/jpm" | "video/mj2" | "video/mp2t" | "video/mp4" | "video/mpeg" | "video/ogg" | "video/quicktime" | "video/vnd.dece.hd" | "video/vnd.dece.mobile" | "video/vnd.dece.pd" | "video/vnd.dece.sd" | "video/vnd.dece.video" | "video/vnd.dvb.file" | "video/vnd.fvt" | "video/vnd.mpegurl" | "video/vnd.ms-playready.media.pyv" | "video/vnd.uvvu.mp4" | "video/vnd.vivo" | "video/webm" | "video/x-f4v" | "video/x-fli" | "video/x-flv" | "video/x-m4v" | "video/x-matroska" | "video/x-mng" | "video/x-ms-asf" | "video/x-ms-vob" | "video/x-ms-wm" | "video/x-ms-wmv" | "video/x-ms-wmx" | "video/x-ms-wvx" | "video/x-msvideo" | "video/x-sgi-movie" | "video/x-smv", ...("video/3gpp" | "video/3gpp2" | "video/h261" | "video/h263" | "video/h264" | "video/iso.segment" | "video/jpeg" | "video/jpm" | "video/mj2" | "video/mp2t" | "video/mp4" | "video/mpeg" | "video/ogg" | "video/quicktime" | "video/vnd.dece.hd" | "video/vnd.dece.mobile" | "video/vnd.dece.pd" | "video/vnd.dece.sd" | "video/vnd.dece.video" | "video/vnd.dvb.file" | "video/vnd.fvt" | "video/vnd.mpegurl" | "video/vnd.ms-playready.media.pyv" | "video/vnd.uvvu.mp4" | "video/vnd.vivo" | "video/webm" | "video/x-f4v" | "video/x-fli" | "video/x-flv" | "video/x-m4v" | "video/x-matroska" | "video/x-mng" | "video/x-ms-asf" | "video/x-ms-vob" | "video/x-ms-wm" | "video/x-ms-wmv" | "video/x-ms-wmx" | "video/x-ms-wvx" | "video/x-msvideo" | "video/x-sgi-movie" | "video/x-smv")[]], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L211)

Since v0.0.0

# utilities

## extractMimeTypes

Extracts all mime-type keys from a mime-type dictionary as a deduplicated array.

**Example**

```ts
import { extractMimeTypes } from "@beep/schema/MimeType"

const htmlExtensions: readonly ["html"] = ["html"]
const plainExtensions: readonly ["txt"] = ["txt"]

const types = extractMimeTypes({
  "text/html": {
    source: "iana",
    extensions: htmlExtensions
  },
  "text/plain": {
    source: "iana",
    extensions: plainExtensions
  }
})
console.log(types)
```

**Signature**

```ts
declare const extractMimeTypes: <const T extends MimeTypeProperty>(mime: T) => ReadonlyArray<MimeTypeKey<T>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MimeType.ts#L66)

Since v0.0.0
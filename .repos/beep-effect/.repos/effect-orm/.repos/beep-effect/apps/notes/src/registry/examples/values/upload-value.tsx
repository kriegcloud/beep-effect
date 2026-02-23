/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@platejs/test-utils";

jsx;

export const uploadValue: any = (
  <fragment>
    <hh2>Upload Files</hh2>
    <hp>Our editor supports various media types for upload, including images, videos, audio, and files.</hp>
    {/* <hp>Ways to upload:</hp>
    <hp indent={1} listStyleType="decimal">
      <htext>Drag & drop files from your computer into the editor.</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>
        Paste from clipboard (for images): Copy and paste directly into the
        editor.
      </htext>
    </hp> */}
    <hp>
      <htext>Use the backslash (/) to insert the upload.</htext>
    </hp>
    <hh3>Images</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Type "/image" to insert the image.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Upload by clicking the button or use "Embed link" to insert a URL.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Resize images using the vertical edge bars.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Use top-right corner options to: align, caption, expand, download, or modify the block.</htext>
    </hp>
    <himg
      align="center"
      url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFuZHNjYXBlfGVufDB8fDB8fHww"
      width="80%"
    >
      <htext />
    </himg>
    <hh3>Videos</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Type "/video" to insert the video.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Upload or embed a video URL.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Resize videos using the vertical edge bars.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Use top-right corner options to: align, caption, view original, or modify the block.</htext>
    </hp>
    <hvideo
      align="center"
      url="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4"
      width="80%"
      isUpload
    >
      <htext />
    </hvideo>
    <hh3>Audio</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Type "/audio" to insert the audio.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Upload or embed an audio URL.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Use the top-right corner to access the block menu and modify the audio block.</htext>
    </hp>
    <haudio align="center" url="https://samplelib.com/lib/preview/mp3/sample-3s.mp3" width="80%">
      <htext />
    </haudio>
    <hh3>Files</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Type "/file" to insert the file.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Upload or embed a file URL.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Use the top-right corner to access the block menu and modify the file block.</htext>
    </hp>
    <hfile
      name="sample.pdf"
      align="center"
      url="https://s26.q4cdn.com/900411403/documents/doc_downloads/test.pdf"
      width="80%"
      isUpload
    >
      <htext />
    </hfile>
    <hcallout variant="info" icon="💡">
      <htext>You can upload multiple files simultaneously to boost your productivity!</htext>
    </hcallout>
  </fragment>
);

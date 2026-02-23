export const downloadFile = async (url: string, filename: string) => {
  const response = await fetch(url);

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  // Clean up the blob URL
  window.URL.revokeObjectURL(blobUrl);
};
